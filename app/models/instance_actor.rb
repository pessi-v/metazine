class InstanceActor < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :name,
    name_field: :name
  )

  # Validate at most one record
  validate :only_one_instance_actor, on: :create

  after_followed :accept_follow

  def accept_follow(follow)
    return unless federails_actor.local?
    follow.accept!
  end

  after_follow_accepted :follow_accepted
  def follow_accepted(follow)
  end

  def to_activitypub_object
    scheme = Rails.application.config.force_ssl ? "https" : "http"
    host = Rails.application.default_url_options[:host]
    port = Rails.application.default_url_options[:port]
    site_host = "#{scheme}://#{host}#{":#{port}" if port}"

    {
      "@context": {
        toot: "http://joinmastodon.org/ns#",
        attributionDomains: {
          "@id": "toot:attributionDomains",
          "@type": "@id"
        }
      },
      type: "Application",
      url: "https://#{ENV["APP_HOST"]}",
      summary: "We recommend hiding Boosts from us",
      icon: {
        type: "Image",
        mediaType: "image/png",
        url: "#{site_host}#{ActionController::Base.helpers.asset_path("instance-logo.png")}"
      },
      image: {
        type: "Image",
        mediaType: "image/jpg",
        url: "#{site_host}#{ActionController::Base.helpers.asset_path("waves.jpg")}"
      }
    }
  end

  private

  def only_one_instance_actor
    if InstanceActor.exists?
      errors.add(:base, "Only one InstanceActor record is allowed")
    end
  end
end
