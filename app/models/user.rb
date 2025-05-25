class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :name,
    name_field: :name,
    auto_create_actors: false
  )

  # has_secure_password
  has_many :sessions, dependent: :destroy

  # normalizes :email_address, with: ->(e) { e.strip.downcase }
  #
  # def to_activitypub_object
  #   scheme = Rails.application.config.force_ssl ? "https" : "http"
  #   host = Rails.application.default_url_options[:host]
  #   port = Rails.application.default_url_options[:port]
  #   site_host = "#{scheme}://#{host}#{port ? ":#{port}" : ""}"

  #   {
  #     "@context": {
  #       toot: "http://joinmastodon.org/ns#",
  #       attributionDomains: {
  #         "@id": "toot:attributionDomains",
  #         "@type": "@id"
  #       }
  #     }
  #   }
  # end
  #

  def name
    "bob"
  end
end
