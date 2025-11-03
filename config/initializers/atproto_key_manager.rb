require 'openssl'
require 'jwt'
require 'base64'
require 'json'

# Custom key manager for AT Protocol OAuth keys
# Supports both environment variables (production) and file storage (development)
class AtprotoKeyManager
  class << self
    KEY_PATH = Rails.root.join('config', 'atproto_private_key.pem')
    JWK_PATH = Rails.root.join('config', 'atproto_jwk.json')

    def current_private_key
      @current_private_key ||= load_private_key
    end

    def current_jwk
      @current_jwk ||= load_jwk
    end

    # Reset cached keys (useful for testing or key rotation)
    def reset!
      @current_private_key = nil
      @current_jwk = nil
    end

    private

    def load_private_key
      # Try environment variable first (production)
      if ENV['ATPROTO_PRIVATE_KEY_PEM'].present?
        Rails.logger.info "Loading AT Protocol private key from environment variable (PEM format)"
        # The PEM is stored directly in the env var
        # Handle both literal \n strings and actual newlines
        pem_data = ENV['ATPROTO_PRIVATE_KEY_PEM']
          .gsub('\\n', "\n")  # Replace literal backslash-n with newline
          .strip

        Rails.logger.info "PEM preview (first 100 chars): #{pem_data[0..100]}"
        Rails.logger.info "PEM length: #{pem_data.length}"

        OpenSSL::PKey.read(pem_data)
      # Try file second (development)
      elsif File.exist?(KEY_PATH)
        Rails.logger.info "Loading AT Protocol private key from file: #{KEY_PATH}"
        # Use OpenSSL::PKey.read() to parse PEM-encoded keys
        OpenSSL::PKey.read(File.read(KEY_PATH))
      # Generate and store if neither exists
      else
        Rails.logger.warn "No AT Protocol keys found, generating new keys..."
        private_key, jwk = generate_key_pair

        # Try to save to files (development)
        begin
          File.write(KEY_PATH, private_key.to_pem)
          File.write(JWK_PATH, JSON.pretty_generate(jwk))
          Rails.logger.info "Generated AT Protocol keys saved to #{KEY_PATH}"
        rescue Errno::EACCES => e
          Rails.logger.warn "Cannot write key files (permission denied), keys will be ephemeral: #{e.message}"
        end

        # Cache the JWK
        @current_jwk = jwk

        private_key
      end
    end

    def load_jwk
      # Try environment variable first (production)
      if ENV['ATPROTO_JWK'].present?
        Rails.logger.info "Loading AT Protocol JWK from environment variable"
        JSON.parse(ENV['ATPROTO_JWK'], symbolize_names: true)
      # Try file second (development)
      elsif File.exist?(JWK_PATH)
        Rails.logger.info "Loading AT Protocol JWK from file: #{JWK_PATH}"
        JSON.parse(File.read(JWK_PATH), symbolize_names: true)
      # If we just generated keys, the JWK is already cached
      elsif @current_jwk
        @current_jwk
      # Generate from private key if we have it
      elsif @current_private_key
        generate_jwk_from_key(@current_private_key)
      else
        raise "AT Protocol JWK not available"
      end
    end

    def generate_key_pair
      key = OpenSSL::PKey::EC.generate('prime256v1')
      private_key = key
      jwk = generate_jwk_from_key(private_key)

      [private_key, jwk]
    end

    def generate_jwk_from_key(private_key)
      public_key = private_key.public_key

      # Get the coordinates for JWK
      bn = public_key.to_bn(:uncompressed)
      raw_bytes = bn.to_s(2)
      coord_bytes = raw_bytes[1..]
      byte_length = coord_bytes.length / 2

      x_coord = coord_bytes[0, byte_length]
      y_coord = coord_bytes[byte_length, byte_length]

      {
        kty: 'EC',
        crv: 'P-256',
        x: Base64.urlsafe_encode64(x_coord, padding: false),
        y: Base64.urlsafe_encode64(y_coord, padding: false),
        use: 'sig',
        alg: 'ES256',
        kid: SecureRandom.uuid
      }
    end
  end
end

# Eagerly load keys at startup to catch any errors early
Rails.application.config.after_initialize do
  begin
    AtprotoKeyManager.current_private_key
    AtprotoKeyManager.current_jwk
    Rails.logger.info "AT Protocol OAuth keys loaded successfully"
  rescue => e
    Rails.logger.error "Failed to load AT Protocol keys: #{e.message}"
    Rails.logger.error e.backtrace.first(5).join("\n")
  end
end
