class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :username,
    name_field: :display_name,
    auto_create_actors: true
  )

  has_many :sessions, dependent: :destroy
  has_many :comments, dependent: :nullify

  validates :provider, :uid, presence: true
  validates :uid, uniqueness: {scope: :provider}

  # Create or update user from omniauth auth hash
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_initialize.tap do |user|
      user.username = auth.info.nickname
      user.display_name = auth.info.name
      user.avatar_url = auth.info.image
      user.access_token = auth.credentials.token
      user.domain = extract_domain(auth)
      user.save!

      # Link to existing federated actor if one exists
      user.link_to_federated_actor!
    end
  end

  # Links this user to an existing federated actor if they're the same person
  # This allows users who commented via ActivityPub to claim ownership when they log in
  def link_to_federated_actor!
    return unless domain.present? && username.present?

    # Construct the expected ActivityPub actor URL
    # Format: https://domain/users/username (standard Mastodon format)
    expected_actor_url = "https://#{domain}/users/#{username}"

    # Find an existing remote actor with this federated_url
    remote_actor = Federails::Actor.find_by(
      federated_url: expected_actor_url,
      local: [false, nil],
      entity_id: nil
    )

    if remote_actor
      Rails.logger.info "Linking User##{id} to remote Federails::Actor##{remote_actor.id}"

      # Associate any comments from this remote actor with the user
      Comment.where(federails_actor: remote_actor, user_id: nil).update_all(user_id: id)

      # Update the actor to point to this user entity
      remote_actor.update!(entity_id: id, entity_type: 'User')

      Rails.logger.info "  Claimed #{Comment.where(user_id: id, federails_actor: remote_actor).count} comments"
    end
  end

  def name
    display_name || username || "User #{id}"
  end

  def full_username
    "@#{username}@#{domain}"
  end

  private

  def self.extract_domain(auth)
    # For Mastodon, the domain is in the auth hash
    auth.info.urls&.dig("Profile")&.match(/https?:\/\/([^\/]+)/)&.[](1) || auth.extra&.raw_info&.instance
  end
end
