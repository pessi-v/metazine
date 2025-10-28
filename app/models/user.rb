class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :username,
    name_field: :display_name,
    auto_create_actors: false  # Don't auto-create, we'll link to remote actor manually
  )

  has_many :sessions, dependent: :destroy
  has_many :comments, dependent: :nullify

  validates :provider, :uid, presence: true
  validates :uid, uniqueness: {scope: :provider}

  # Create or update user from omniauth auth hash
  def self.from_omniauth(auth)
    Rails.logger.info "=== from_omniauth called ==="
    Rails.logger.info "  provider: #{auth.provider}"
    Rails.logger.info "  uid: #{auth.uid}"
    Rails.logger.info "  info.nickname: #{auth.info.nickname}"
    Rails.logger.info "  info.name: #{auth.info.name}"
    Rails.logger.info "  info.urls: #{auth.info.urls.inspect}"
    Rails.logger.info "  extra.raw_info: #{auth.extra&.raw_info&.to_h&.keys&.inspect}"
    Rails.logger.info "  extra.raw_info.instance: #{auth.extra&.raw_info&.instance}"
    Rails.logger.info "  extra.raw_info.url: #{auth.extra&.raw_info&.url}"

    where(provider: auth.provider, uid: auth.uid).first_or_initialize.tap do |user|
      user.username = auth.info.nickname
      user.display_name = auth.info.name
      user.avatar_url = auth.info.image
      user.access_token = auth.credentials.token
      user.domain = extract_domain(auth)

      Rails.logger.info "  Extracted domain: #{user.domain.inspect}"
      user.save!

      # Link to existing federated actor if one exists
      user.link_to_federated_actor!
    end
  end

  # Links this user to an existing federated actor or fetches it from the remote server
  # This allows users who commented via ActivityPub to claim ownership when they log in
  def link_to_federated_actor!
    return unless domain.present? && username.present?

    # Construct the expected ActivityPub actor URL
    # Format: https://domain/users/username (standard Mastodon format)
    expected_actor_url = "https://#{domain}/users/#{username}"

    Rails.logger.info "=== Linking User##{id} to actor ==="
    Rails.logger.info "  Expected URL: #{expected_actor_url}"

    # Find existing remote actor or fetch it from the remote server
    remote_actor = Federails::Actor.find_by_federation_url(expected_actor_url)

    unless remote_actor
      Rails.logger.warn "  Could not find or fetch actor from #{expected_actor_url}"
      return
    end

    Rails.logger.info "  Found/fetched Actor##{remote_actor.id}"
    Rails.logger.info "    server: #{remote_actor.server}"
    Rails.logger.info "    local: #{remote_actor.local}"
    Rails.logger.info "    persisted: #{remote_actor.persisted?}"

    # Ensure the actor is saved and marked as remote (not local)
    unless remote_actor.persisted?
      remote_actor.local = false
      remote_actor.save!
    end

    # If actor is already linked to this user, update attributes and we're done
    if remote_actor.entity_id == id && remote_actor.entity_type == 'User'
      Rails.logger.info "  Already linked! Updating actor attributes..."
      update_actor_attributes(remote_actor)
      return
    end

    # If actor is linked to a different entity, something is wrong
    if remote_actor.entity_id.present? && remote_actor.entity_id != id
      Rails.logger.warn "  Actor is already linked to #{remote_actor.entity_type}##{remote_actor.entity_id}"
      return
    end

    # Link the actor to this user and update attributes
    remote_actor.update!(entity_id: id, entity_type: 'User', local: false)
    update_actor_attributes(remote_actor)

    # Claim any comments from this actor
    claimed_count = Comment.where(federails_actor: remote_actor, user_id: nil).update_all(user_id: id)

    Rails.logger.info "  Successfully linked! Claimed #{claimed_count} comments"
  end

  # Update actor attributes from user data
  def update_actor_attributes(actor)
    updates = {}
    updates[:name] = display_name if display_name.present? && actor.name != display_name
    updates[:username] = username if username.present? && actor.username != username

    # Avatar URL is stored in extensions JSON field for remote actors
    if avatar_url.present?
      extensions = actor.extensions || {}
      if extensions['icon'].is_a?(Hash) && extensions['icon']['url'] != avatar_url
        extensions['icon'] = { 'type' => 'Image', 'mediaType' => 'image/jpeg', 'url' => avatar_url }
        updates[:extensions] = extensions
      elsif !extensions['icon']
        extensions['icon'] = { 'type' => 'Image', 'mediaType' => 'image/jpeg', 'url' => avatar_url }
        updates[:extensions] = extensions
      end
    end

    if updates.any?
      actor.update!(updates)
      Rails.logger.info "    Updated actor attributes: #{updates.keys.join(', ')}"
    else
      Rails.logger.info "    No actor attribute updates needed"
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
    # Try multiple sources in order of preference:
    # 1. info.urls.domain (direct domain field)
    # 2. info.urls["profile"] (lowercase key)
    # 3. extra.raw_info.url (user's profile URL)
    # 4. extra.raw_info.instance (instance domain)
    domain = auth.info.urls&.domain&.match(/https?:\/\/([^\/]+)/)&.[](1) ||
             auth.info.urls&.[]("profile")&.match(/https?:\/\/([^\/]+)/)&.[](1) ||
             auth.extra&.raw_info&.url&.match(/https?:\/\/([^\/]+)/)&.[](1) ||
             auth.extra&.raw_info&.instance

    Rails.logger.info "  extract_domain result: #{domain.inspect}"
    domain
  end
end
