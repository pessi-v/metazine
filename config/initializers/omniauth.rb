Rails.application.config.middleware.use OmniAuth::Builder do
  # Mastodon strategy with dynamic client credentials
  # Scopes are defined in MastodonClient::SCOPES (single source of truth)
  provider :mastodon,
    scopes: MastodonClient::SCOPES,
    credentials: lambda { |domain, callback_url|
      puts "\n=== OmniAuth Credentials Phase ==="
      puts "Domain: #{domain}"
      puts "Callback URL: #{callback_url}"

      # Find or register the Mastodon app for this domain
      begin
        mastodon_client = MastodonClient.find_by(domain: domain)

        unless mastodon_client
          puts "No existing client found, registering new app..."
          mastodon_client = MastodonClient.register_app(domain)
        else
          puts "Found existing client for #{domain}"
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
end

# Configure OmniAuth
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

# For Cloudflare Tunnel compatibility: store state in cookie to survive redirects
OmniAuth.config.request_validation_phase = proc { |env|
  # Store state in a more persistent way for Cloudflare Tunnel
  request = Rack::Request.new(env)
  if request.params['state']
    # During callback, retrieve state from cookie
    stored_state = request.cookies['omniauth.state']
    env['rack.session']['omniauth.state'] = stored_state if stored_state
  end
}

# Log all OmniAuth failures
OmniAuth.config.on_failure = proc { |env|
  puts "\n=== OmniAuth Failure Detected ==="
  error = env['omniauth.error']
  error_type = env['omniauth.error.type']
  puts "Error Type: #{error_type}"
  puts "Error: #{error&.class} - #{error&.message}"
  puts error&.backtrace&.first(10)&.join("\n") if error
  puts "=== End OmniAuth Failure ==="

  # Call the default failure handler
  OmniAuth::FailureEndpoint.new(env).call
}
