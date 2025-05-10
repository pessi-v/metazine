class InstanceActor < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :name,
    name_field: :name
  )

  # Validate at most one record
  validate :only_one_instance_actor

  after_followed :accept_follow

  def accept_follow(follow)
    return unless federails_actor.local?
    follow.accept!
  end

  after_follow_accepted :follow_accepted
  def follow_accepted(follow)
  end

  def to_activitypub_object
    {
      "@context": {
        toot: "http://joinmastodon.org/ns#",
        attributionDomains: {
          "@id": "toot:attributionDomains",
          "@type": "@id"
        }
      },
      icon: [
        type: "Image",
        mediaType: "image/jpg",
        url: ActionController::Base.helpers.asset_url("instance-logo.jpeg")
      ],
      Image: [
        type: "Image",
        mediaType: "image/jpg",
        url: ActionController::Base.helpers.asset_url("waves.jpg")
      ]
    }
  end

  private

  def only_one_instance_actor
    if InstanceActor.exists?
      errors.add(:base, "Only one InstanceActor record is allowed")
    end
  end
end
