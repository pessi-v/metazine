Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer if Rails.env.development?
  provider :mastodon, scopes: "read write follow", credentials: lambda { |domain, callback_url|
    Rails.logger.info "Requested credentials for #{domain} with callback URL #{callback_url}"

    existing = MastodonClient.find_by(domain: domain)
    return [existing.client_id, existing.client_secret] unless existing.nil?

    client = Mastodon::REST::Client.new(base_url: "https://#{domain}")
    app = client.create_app(ENV["INSTANCE_NAME"], callback_url)

    MastodonClient.create!(domain: domain, client_id: app.client_id, client_secret: app.client_secret)

    [app.client_id, app.client_secret]
  }
end

OmniAuth.config.on_failure = proc do |env|
  OmniAuth::FailureEndpoint.new(env).redirect_to_failure
end
