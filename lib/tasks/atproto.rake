namespace :atproto do
  desc "Generate AT Protocol OAuth keys and display environment variables for production"
  task generate_keys: :environment do
    require 'openssl'
    require 'base64'
    require 'json'

    puts "\n=== Generating AT Protocol OAuth Keys ==="

    # Generate key pair
    key = OpenSSL::PKey::EC.generate('prime256v1')
    private_key = key
    public_key = key.public_key

    # Generate JWK
    bn = public_key.to_bn(:uncompressed)
    raw_bytes = bn.to_s(2)
    coord_bytes = raw_bytes[1..]
    byte_length = coord_bytes.length / 2

    x_coord = coord_bytes[0, byte_length]
    y_coord = coord_bytes[byte_length, byte_length]

    jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: Base64.urlsafe_encode64(x_coord, padding: false),
      y: Base64.urlsafe_encode64(y_coord, padding: false),
      use: 'sig',
      alg: 'ES256',
      kid: SecureRandom.uuid
    }

    # Save to files (for development)
    key_path = Rails.root.join('config', 'atproto_private_key.pem')
    jwk_path = Rails.root.join('config', 'atproto_jwk.json')

    File.write(key_path, private_key.to_pem)
    File.write(jwk_path, JSON.pretty_generate(jwk))

    puts "✓ Keys saved to:"
    puts "  - #{key_path}"
    puts "  - #{jwk_path}"

    # Generate environment variables for production
    private_key_base64 = Base64.strict_encode64(private_key.to_pem)
    jwk_json = jwk.to_json

    puts "\n=== Environment Variables for Production ==="
    puts "\nAdd these to your .env or secrets management system:\n\n"
    puts "ATPROTO_PRIVATE_KEY=#{private_key_base64}"
    puts "\nATPROTO_JWK='#{jwk_json}'"
    puts "\n=== End ==="
    puts "\nIMPORTANT: Keep these values secret! Do not commit them to version control."
    puts "These keys will also work from the files in development mode.\n\n"
  end

  desc "Display current keys as environment variables"
  task export_keys: :environment do
    key_path = Rails.root.join('config', 'atproto_private_key.pem')
    jwk_path = Rails.root.join('config', 'atproto_jwk.json')

    unless File.exist?(key_path) && File.exist?(jwk_path)
      puts "ERROR: Keys not found. Run 'rake atproto:generate_keys' first."
      exit 1
    end

    private_key_pem = File.read(key_path)
    jwk = JSON.parse(File.read(jwk_path))

    private_key_base64 = Base64.strict_encode64(private_key_pem)
    jwk_json = jwk.to_json

    puts "\n=== Environment Variables for Production ==="
    puts "\nATProto_PRIVATE_KEY=#{private_key_base64}"
    puts "\nATPROTO_JWK='#{jwk_json}'"
    puts "\n"
  end

  desc "Test key loading"
  task test_keys: :environment do
    puts "\n=== Testing AT Protocol Key Loading ==="

    begin
      private_key = AtprotoKeyManager.current_private_key
      jwk = AtprotoKeyManager.current_jwk

      puts "✓ Private key loaded successfully"
      puts "  Type: #{private_key.class}"
      puts "  Algorithm: #{private_key.group.curve_name}"

      puts "\n✓ JWK loaded successfully"
      puts "  kid: #{jwk[:kid]}"
      puts "  alg: #{jwk[:alg]}"
      puts "  crv: #{jwk[:crv]}"

      puts "\n✓ All keys loaded successfully!"
    rescue => e
      puts "\n✗ ERROR loading keys:"
      puts "  #{e.class}: #{e.message}"
      puts "\n  #{e.backtrace.first(5).join("\n  ")}"
      exit 1
    end
  end
end
