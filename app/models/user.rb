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
    Rails.logger.info "  info: #{auth.info.inspect}"
    Rails.logger.info "  credentials: #{auth.credentials.inspect}"
    Rails.logger.info "  extra: #{auth.extra&.to_h&.keys&.inspect}"

    # For AT Protocol, the DID is in auth.info.did instead of auth.uid
    # DISABLED: ATProto/Bluesky integration temporarily disabled
    # uid = auth.provider == 'atproto' ? auth.info.did : auth.uid
    uid = auth.uid

    where(provider: auth.provider, uid: uid).first_or_initialize.tap do |user|
      # DISABLED: ATProto/Bluesky integration temporarily disabled
      # if auth.provider == 'atproto'
      #   # Bluesky/AT Protocol authentication
      #   user.uid = uid  # Ensure UID is set (it's the DID)
      #   user.access_token = auth.credentials.token
      #
      #   # Fetch profile info from Bluesky API using DID
      #   Rails.logger.info "  Fetching Bluesky profile for DID: #{auth.info.did}"
      #   profile = fetch_bluesky_profile(auth.info.did, auth.credentials.token)
      #
      #   if profile
      #     Rails.logger.info "  Profile fetched successfully: #{profile['handle']}"
      #     user.username = profile['handle']
      #     user.display_name = profile.dig('displayName') || profile['handle']
      #     user.avatar_url = profile.dig('avatar')
      #     user.domain = 'bsky.social' # Default for now, could extract from PDS
      #   else
      #     # Fallback if profile fetch fails
      #     Rails.logger.warn "  Profile fetch failed, using DID as username"
      #     user.username = auth.info.did.split(':').last.slice(0, 20)
      #     user.display_name = user.username
      #     user.domain = 'bsky.social'
      #   end
      # else
        # Mastodon authentication
        user.username = auth.info.nickname
        user.display_name = auth.info.name
        user.avatar_url = auth.info.image
        user.access_token = auth.credentials.token
        user.domain = extract_domain(auth)
      # end # DISABLED: ATProto/Bluesky integration temporarily disabled

      Rails.logger.info "  Extracted domain: #{user.domain.inspect}"
      user.save!

      # Link to existing federated actor if one exists (Mastodon only for now)
      # DISABLED: ATProto/Bluesky integration temporarily disabled
      # user.link_to_federated_actor! if auth.provider != 'atproto'
      user.link_to_federated_actor!
    end
  end

  # Fetch Bluesky profile using the AT Protocol API
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # def self.fetch_bluesky_profile(did, access_token)
  #   require 'net/http'
  #   require 'uri'
  #   require 'json'
  #
  #   # Use the public Bluesky API to fetch profile
  #   # app.bsky.actor.getProfile requires authentication
  #   uri = URI("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile")
  #   uri.query = URI.encode_www_form(actor: did)
  #
  #   request = Net::HTTP::Get.new(uri)
  #   request['Authorization'] = "Bearer #{access_token}"
  #
  #   response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  #     http.request(request)
  #   end
  #
  #   if response.is_a?(Net::HTTPSuccess)
  #     JSON.parse(response.body)
  #   else
  #     Rails.logger.error "Failed to fetch Bluesky profile: #{response.code} #{response.message}"
  #     nil
  #   end
  # rescue => e
  #   Rails.logger.error "Failed to fetch Bluesky profile for #{did}: #{e.message}"
  #   Rails.logger.error e.backtrace.first(5).join("\n")
  #   nil
  # end

  # Links this user to an existing federated actor or fetches it from the remote server
  # This allows users who commented via ActivityPub to claim ownership when they log in
  def link_to_federated_actor!
    return unless domain.present? && username.present?

    # If user is already linked to an actor, skip linking (prevents double-login errors)
    existing_link = Federails::Actor.find_by(entity_type: 'User', entity_id: id)
    if existing_link
      Rails.logger.info "=== User##{id} already linked to Actor##{existing_link.id}, skipping ==="
      return
    end

    # Construct the expected ActivityPub actor URL
    # Format: https://domain/users/username (standard Mastodon format)
    expected_actor_url = "https://#{domain}/users/#{username}"

    Rails.logger.info "=== Linking User##{id} to actor ==="
    Rails.logger.info "  Expected URL: #{expected_actor_url}"

    # First, try to find existing actor by federated_url
    remote_actor = Federails::Actor.find_by(federated_url: expected_actor_url)

    # If not found, try to fetch from remote server
    unless remote_actor
      remote_actor = Federails::Actor.find_by_federation_url(expected_actor_url)
    end

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
      begin
        remote_actor.save!
      rescue ActiveRecord::RecordInvalid => e
        # If save fails due to duplicate, try to find the existing one
        if e.message.include?("Federated url has already been taken")
          Rails.logger.warn "  Actor save failed (duplicate), finding existing actor..."
          remote_actor = Federails::Actor.find_by(federated_url: expected_actor_url)
          unless remote_actor
            Rails.logger.error "  Could not find existing actor after duplicate error"
            return
          end
        else
          raise
        end
      end
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

  # Fix user's domain and re-link to the correct remote actor
  # This is useful for users who logged in before domain extraction was fixed
  def fix_domain_and_relink!
    Rails.logger.info "=== Fixing domain for User##{id} ==="

    # If domain is already set, check if it's correct
    if domain.present?
      Rails.logger.info "  Domain already set: #{domain}"

      # Check if linked actor matches the domain
      if federails_actor&.federated_url.present?
        actor_domain = URI.parse(federails_actor.federated_url).host rescue nil
        if actor_domain && actor_domain != domain
          Rails.logger.warn "  ⚠️  Actor domain (#{actor_domain}) doesn't match user domain (#{domain})"
          Rails.logger.warn "  Proceeding with re-linking..."
        else
          Rails.logger.info "  Domain and actor match, no fix needed"
          return
        end
      end
    end

    # Try to extract domain from existing federails_actor
    if federails_actor&.federated_url.present? && federails_actor.distant?
      extracted_domain = URI.parse(federails_actor.federated_url).host rescue nil
      if extracted_domain
        Rails.logger.info "  Extracted domain from actor URL: #{extracted_domain}"

        # Also try to extract username from actor URL
        # Format: https://domain/users/username
        if federails_actor.federated_url =~ %r{https?://[^/]+/users/([^/]+)}
          extracted_username = $1
          Rails.logger.info "  Extracted username from actor URL: #{extracted_username}"

          update!(domain: extracted_domain, username: extracted_username)
          Rails.logger.info "  ✓ Updated domain and username"
          return
        end
      end
    end

    # If we still don't have domain, try to infer from comments
    if domain.blank?
      # Find comments authored by this user's actor
      comment_with_url = Comment.where(federails_actor: federails_actor)
                                .where.not(federated_url: nil)
                                .first

      if comment_with_url&.federated_url.present?
        Rails.logger.info "  Found comment with federated_url: #{comment_with_url.federated_url}"

        # Extract domain and username from comment URL
        # Format: https://domain/users/username/statuses/123
        if comment_with_url.federated_url =~ %r{https?://([^/]+)/users/([^/]+)/statuses}
          inferred_domain = $1
          inferred_username = $2

          Rails.logger.info "  Inferred domain: #{inferred_domain}"
          Rails.logger.info "  Inferred username: #{inferred_username}"

          update!(domain: inferred_domain, username: inferred_username)

          # Now unlink from current (wrong) actor and re-link to correct one
          if federails_actor&.local?
            Rails.logger.info "  Unlinking from local actor (incorrect)"
            federails_actor.update!(entity_type: nil, entity_id: nil)
          end

          # Re-link to remote actor
          link_to_federated_actor!

          Rails.logger.info "  ✓ Fixed domain and re-linked to remote actor"
          return
        end
      end
    end

    Rails.logger.error "  ❌ Could not fix domain - no data available"
  end

  private

  def self.extract_domain(auth)
    # For Mastodon, the domain is in the auth hash
    # Try multiple sources in order of preference:
    Rails.logger.info "  Extracting domain from auth hash..."
    Rails.logger.info "    auth.info.urls: #{auth.info.urls.inspect}"
    Rails.logger.info "    auth.extra.raw_info keys: #{auth.extra&.raw_info&.to_h&.keys&.inspect}"

    # Try various extraction methods
    domain = nil

    # 1. From raw_info.url (user's profile URL) - most reliable
    if auth.extra&.raw_info&.url.present?
      domain = auth.extra.raw_info.url.match(/https?:\/\/([^\/]+)/)&.[](1)
      Rails.logger.info "    Extracted from raw_info.url: #{domain}" if domain
    end

    # 2. From info.urls (various formats)
    unless domain
      if auth.info.urls.is_a?(Hash)
        # Try each URL in the hash
        auth.info.urls.each do |key, value|
          if value.is_a?(String) && value.match?(/https?:\/\//)
            domain = value.match(/https?:\/\/([^\/]+)/)&.[](1)
            Rails.logger.info "    Extracted from info.urls.#{key}: #{domain}" if domain
            break if domain
          end
        end
      elsif auth.info.urls.respond_to?(:profile)
        domain = auth.info.urls.profile&.match(/https?:\/\/([^\/]+)/)&.[](1)
        Rails.logger.info "    Extracted from info.urls.profile: #{domain}" if domain
      end
    end

    # 3. From extra.raw_info.instance (direct instance field)
    unless domain
      if auth.extra&.raw_info&.instance.present?
        domain = auth.extra.raw_info.instance
        Rails.logger.info "    Extracted from raw_info.instance: #{domain}"
      end
    end

    # 4. From provider-specific domain (omniauth-mastodon stores this)
    unless domain
      if auth.info.respond_to?(:domain) && auth.info.domain.present?
        domain = auth.info.domain
        Rails.logger.info "    Extracted from info.domain: #{domain}"
      end
    end

    Rails.logger.info "  Final extract_domain result: #{domain.inspect}"

    unless domain
      Rails.logger.error "  ❌ FAILED TO EXTRACT DOMAIN!"
      Rails.logger.error "  Full auth.info: #{auth.info.to_h.inspect}"
      Rails.logger.error "  Full auth.extra.raw_info: #{auth.extra&.raw_info&.to_h&.inspect}"
    end

    domain
  end
end
