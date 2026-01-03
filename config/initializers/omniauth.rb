# Custom setup for AT Protocol OAuth with enhanced error handling
# DISABLED: ATProto/Bluesky integration temporarily disabled
# module OmniAuth
#   module Strategies
#     class Atproto
#       def self.enhanced_setup
#         lambda do |env|
#           session = env["rack.session"]
#           request = Rack::Request.new(env)
#
#           Rails.logger.info "=== AT Protocol OAuth Setup Phase ==="
#
#           # Get handle from session (stored by SessionsController#bluesky)
#           handle = session["atproto_handle"]
#
#           Rails.logger.info "  Handle from session: #{handle}"
#
#           unless handle
#             Rails.logger.error "  ERROR: No handle found in session"
#             env['omniauth.strategy'].fail!(:missing_handle,
#               OmniAuth::Error.new('Handle not found in session. Please try again.'))
#             return
#           end
#
#           begin
#             Rails.logger.info "  Resolving handle to DID..."
#             resolver = DIDKit::Resolver.new
#             did = resolver.resolve_handle(handle)
#
#             unless did
#               Rails.logger.error "  ERROR: Handle did not resolve to a DID"
#               env['omniauth.strategy'].fail!(:unknown_handle,
#                 OmniAuth::Error.new("Handle '#{handle}' could not be resolved to a DID"))
#               return
#             end
#
#             Rails.logger.info "  DID resolved: #{did}"
#             Rails.logger.info "  Resolving DID to PDS endpoint..."
#
#             did_document = resolver.resolve_did(did)
#             endpoint = did_document.pds_endpoint
#
#             unless endpoint
#               Rails.logger.error "  ERROR: Could not find PDS endpoint for DID"
#               env['omniauth.strategy'].fail!(:no_pds_endpoint,
#                 OmniAuth::Error.new("Could not find PDS endpoint for #{did}"))
#               return
#             end
#
#             Rails.logger.info "  PDS endpoint: #{endpoint}"
#             Rails.logger.info "  Getting authorization server..."
#
#             auth_server = OmniAuth::Strategies::Atproto.get_authorization_server(endpoint)
#             Rails.logger.info "  Authorization server: #{auth_server}"
#
#             Rails.logger.info "  Getting authorization metadata..."
#             authorization_info = OmniAuth::Strategies::Atproto.get_authorization_data(auth_server)
#
#             Rails.logger.info "  Issuer: #{authorization_info['issuer']}"
#             Rails.logger.info "  Authorize URL: #{authorization_info['authorization_endpoint']}"
#             Rails.logger.info "  Token URL: #{authorization_info['token_endpoint']}"
#
#             session["authorization_info"] = authorization_info
#             # Handle is already in session from SessionsController#bluesky
#
#             # Set the OAuth2 client options
#             env['omniauth.strategy'].options.client_options.site = authorization_info["issuer"]
#             env['omniauth.strategy'].options.client_options.authorize_url = authorization_info['authorization_endpoint']
#             env['omniauth.strategy'].options.client_options.token_url = authorization_info['token_endpoint']
#
#             Rails.logger.info "=== AT Protocol OAuth Setup Complete ==="
#
#           rescue => e
#             Rails.logger.error "  ERROR in AT Protocol setup: #{e.class} - #{e.message}"
#             Rails.logger.error "  Backtrace: #{e.backtrace.first(5).join("\n  ")}"
#             env['omniauth.strategy'].fail!(:setup_error,
#               OmniAuth::Error.new("OAuth setup failed: #{e.message}"))
#           end
#         end
#       end
#     end
#   end
# end

Rails.application.config.middleware.use OmniAuth::Builder do
  # Mastodon strategy with dynamic client credentials
  # Scopes are defined in MastodonClient::SCOPES (single source of truth)
  provider :mastodon,
    scope: MastodonClient::SCOPES,
    credentials: lambda { |domain, callback_url|
      puts "\n=== OmniAuth Credentials Phase ==="
      puts "Domain: #{domain}"
      puts "Callback URL: #{callback_url}"

      # Find or register the Mastodon app for this domain
      begin
        mastodon_client = MastodonClient.find_by(domain: domain)

        if mastodon_client
          puts "Found existing client for #{domain}"
        else
          puts "No existing client found, registering new app..."
          mastodon_client = MastodonClient.register_app(domain)
        end

        unless mastodon_client
          puts "ERROR: Failed to get or create MastodonClient"
          raise "Failed to register Mastodon app for #{domain}"
        end

        puts "=== OmniAuth Credentials Complete ==="
        [mastodon_client.client_id, mastodon_client.client_secret]
      rescue => e
        puts "ERROR in credentials lambda: #{e.class} - #{e.message}"
        raise
      end
    }

  # AT Protocol (Bluesky) strategy
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # Uses ES256 key-based authentication instead of client_id/client_secret
  # Keys are loaded from environment variables or generated/stored in files
  # Load keys eagerly (not lazily) so they're actual objects, not Procs
  # atproto_private_key = AtprotoKeyManager.current_private_key
  # atproto_jwk = AtprotoKeyManager.current_jwk
  #
  # provider :atproto,
  #   scope: 'atproto transition:generic',
  #   client_id: (Rails.env.development? ?
  #     "http://localhost:3000/oauth/client-metadata.json" :
  #     "https://#{ENV['APP_HOST']}/oauth/client-metadata.json"),
  #   private_key: atproto_private_key,
  #   client_jwk: atproto_jwk,
  #   setup: OmniAuth::Strategies::Atproto.enhanced_setup
end

# Configure OmniAuth
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

# For Cloudflare Tunnel compatibility: store state in cookie to survive redirects
OmniAuth.config.request_validation_phase = proc { |env|
  # Store state in a more persistent way for Cloudflare Tunnel
  request = Rack::Request.new(env)
  if request.params["state"]
    # During callback, retrieve state from cookie
    stored_state = request.cookies["omniauth.state"]
    env["rack.session"]["omniauth.state"] = stored_state if stored_state
  end
}

# Log all OmniAuth failures
OmniAuth.config.on_failure = proc { |env|
  puts "\n=== OmniAuth Failure Detected ==="
  error = env["omniauth.error"]
  error_type = env["omniauth.error.type"]
  puts "Error Type: #{error_type}"
  puts "Error: #{error&.class} - #{error&.message}"
  puts error&.backtrace&.first(10)&.join("\n") if error
  puts "=== End OmniAuth Failure ==="

  # Call the default failure handler
  OmniAuth::FailureEndpoint.new(env).call
}
