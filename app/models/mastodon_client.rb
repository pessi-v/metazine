class MastodonClient < ApplicationRecord
  # Single source of truth for OAuth scopes
  # Using granular scopes for modern Mastodon compatibility
  SCOPES = "read write:statuses write:follows"

  validates :domain, :client_id, :client_secret, presence: true
  validates :domain, uniqueness: true

  # Register a new OAuth application with a Mastodon instance
  def self.register_app(domain)
    return find_by(domain: domain) if exists?(domain: domain)

    puts "Registering new Mastodon app for domain: #{domain}"
    puts "Callback URL: #{callback_url}"
    puts "Website URL: #{root_url}"

    client = Mastodon::REST::Client.new(base_url: "https://#{domain}")
    # create_app takes positional arguments: (name, redirect_uri, scopes, website)
    app = client.create_app(
      Rails.application.config.app_name || "Metazine",
      callback_url,
      SCOPES,
      root_url
    )

    puts "Successfully registered app for #{domain}: client_id=#{app.client_id}"

    create!(
      domain: domain,
      client_id: app.client_id,
      client_secret: app.client_secret
    )
  rescue StandardError => e
    Rails.logger.error "ERROR: Failed to register Mastodon app for #{domain}: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace.first(10).join("\n")
    puts "ERROR: Failed to register Mastodon app for #{domain}: #{e.class} - #{e.message}"
    puts e.backtrace.first(10).join("\n")
    raise # Re-raise so OmniAuth can show proper error
  end

  private

  def self.callback_url
    if Rails.env.development?
      "http://localhost:3000/auth/mastodon/callback"
    else
      "https://#{ENV['APP_HOST']}/auth/mastodon/callback"
    end
  end

  def self.root_url
    if Rails.env.development?
      "http://localhost:3000"
    else
      "https://#{ENV['APP_HOST']}"
    end
  end
end
