class MastodonClient < ApplicationRecord
  validates :domain, :client_id, :client_secret, presence: true
  validates :domain, uniqueness: true

  # Register a new OAuth application with a Mastodon instance
  def self.register_app(domain)
    return find_by(domain: domain) if exists?(domain: domain)

    puts "Registering new Mastodon app for domain: #{domain}"
    puts "Callback URL: #{callback_url}"
    puts "Website URL: #{root_url}"

    client = Mastodon::REST::Client.new(base_url: "https://#{domain}")
    app = client.create_app(
      app_name: Rails.application.config.app_name || "Metazine",
      redirect_uris: callback_url,
      scopes: "read write follow",
      website: root_url
    )

    puts "Successfully registered app for #{domain}: client_id=#{app.client_id}"

    create!(
      domain: domain,
      client_id: app.client_id,
      client_secret: app.client_secret
    )
  rescue StandardError => e
    puts "ERROR: Failed to register Mastodon app for #{domain}: #{e.class} - #{e.message}"
    puts e.backtrace.first(10).join("\n")
    nil
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
