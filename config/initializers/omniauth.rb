Rails.application.config.middleware.use OmniAuth::Builder do
  # Mastodon strategy with dynamic client credentials
  provider :mastodon,
    scopes: "read write follow",
    credentials: lambda { |domain, callback_url|
      puts "\n=== OmniAuth Credentials Phase ==="
      puts "Domain: #{domain}"
      puts "Callback URL: #{callback_url}"

      existing = MastodonClient.find_by(domain: domain)

      if existing
        puts "Found existing client for #{domain}"
        return [existing.client_id, existing.client_secret]
      end

      puts "Registering new Mastodon app for domain: #{domain}"

      client = Mastodon::REST::Client.new(base_url: "https://#{domain}")
      app = client.create_app(
        Rails.application.config.app_name || "Metazine",
        callback_url
      )

      puts "Successfully registered app, client_id: #{app.client_id}"

      MastodonClient.create!(
        domain: domain,
        client_id: app.client_id,
        client_secret: app.client_secret
      )

      puts "=== OmniAuth Credentials Complete ==="
      [app.client_id, app.client_secret]
    }
end

# Configure OmniAuth
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

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
  OmniAuth::FailureEndpoint.new(env).call(env)
}
