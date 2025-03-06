require 'federails/utils/host'
require 'fediverse/webfinger'

module Federails
  # Model storing _distant_ actors and links to local ones.
  #
  # To make a model act as an actor, use the `Federails::ActorEntity` concern
  #
  # See also:
  #  - https://www.w3.org/TR/activitypub/#actor-objects
  class Actor < ApplicationRecord # rubocop:disable Metrics/ClassLength
    include Federails::HasUuid

    validates :federated_url, presence: { unless: :entity }, uniqueness: { unless: :entity }
    validates :username, presence: { unless: :entity }
    validates :server, presence: { unless: :entity }
    validates :inbox_url, presence: { unless: :entity }
    validates :outbox_url, presence: { unless: :entity }
    validates :followers_url, presence: { unless: :entity }
    validates :followings_url, presence: { unless: :entity }
    validates :profile_url, presence: { unless: :entity }
    validates :entity_id, uniqueness: { scope: :entity_type }, if: :local?

    belongs_to :entity, polymorphic: true, optional: true
    # FIXME: Handle this with something like undelete
    has_many :activities, dependent: :destroy
    has_many :activities_as_entity, class_name: 'Federails::Activity', as: :entity, dependent: :destroy
    has_many :following_followers, class_name: 'Federails::Following', foreign_key: :target_actor_id, dependent: :destroy, inverse_of: :target_actor
    has_many :following_follows, class_name: 'Federails::Following', dependent: :destroy, inverse_of: :actor
    has_many :followers, source: :actor, through: :following_followers
    has_many :follows, source: :target_actor, through: :following_follows

    scope :local, -> { where.not(entity: nil) }
    scope :distant, -> { where.not(federated_url: nil) }

    def local?
      entity.present?
    end

    def federated_url
      local? ? Federails::Engine.routes.url_helpers.server_actor_url(self) : attributes['federated_url'].presence
    end

    def username
      return attributes['username'] unless local?

      entity.send(entity_configuration[:username_field]).to_s
    end

    def name
      value = (entity.send(entity_configuration[:name_field]).to_s if local?)

      value || attributes['name'] || username
    end

    def server
      local? ? Utils::Host.localhost : attributes['server']
    end

    def inbox_url
      local? ? Federails::Engine.routes.url_helpers.server_actor_inbox_url(self) : attributes['inbox_url']
    end

    def outbox_url
      local? ? Federails::Engine.routes.url_helpers.server_actor_outbox_url(self) : attributes['outbox_url']
    end

    def followers_url
      local? ? Federails::Engine.routes.url_helpers.followers_server_actor_url(self) : attributes['followers_url']
    end

    def followings_url
      local? ? Federails::Engine.routes.url_helpers.following_server_actor_url(self) : attributes['followings_url']
    end

    def profile_url
      return attributes['profile_url'].presence unless local?

      method = entity_configuration[:profile_url_method]
      return Federails::Engine.routes.url_helpers.server_actor_url self unless method

      Rails.application.routes.url_helpers.send method, [entity]
    end

    def at_address
      "#{username}@#{server}"
    end

    def short_at_address
      local? ? "@#{username}" : at_address
    end

    def follows?(actor)
      list = following_follows.where target_actor: actor
      return list.first if list.count == 1

      false
    end

    def entity_configuration
      raise("Entity not configured for #{entity_type}. Did you use \"acts_as_federails_actor\"?") unless Federails.actor_entity? entity_type

      Federails.actor_entity entity_type
    end

    class << self
      def find_by_account(account) # rubocop:todo Metrics/AbcSize
        parts = Fediverse::Webfinger.split_account account

        if Fediverse::Webfinger.local_user? parts
          actor = nil
          Federails::Configuration.actor_types.each_value do |entity|
            actor ||= entity[:class].find_by(entity[:username_field] => parts[:username])&.federails_actor
          end
          raise ActiveRecord::RecordNotFound if actor.nil?
        else
          actor = find_by username: parts[:username], server: parts[:domain]
          actor ||= Fediverse::Webfinger.fetch_actor(parts[:username], parts[:domain])
        end

        actor
      end

      def find_by_federation_url(federated_url)
        local_route = Utils::Host.local_route federated_url
        return find_param(local_route[:id]) if local_route && local_route[:controller] == 'federails/server/actors' && local_route[:action] == 'show'

        actor = find_by federated_url: federated_url
        return actor if actor

        Fediverse::Webfinger.fetch_actor_url(federated_url)
      end

      def find_or_create_by_account(account)
        actor = find_by_account account
        # Create/update distant actors
        actor.save! unless actor.local?

        actor
      end

      def find_or_create_by_federation_url(url)
        actor = find_by_federation_url url
        # Create/update distant actors
        actor.save! unless actor.local?

        actor
      end

      # Find or create actor from a given actor hash or actor id (actor's URL)
      def find_or_create_by_object(object)
        case object
        when String
          find_or_create_by_federation_url object
        when Hash
          find_or_create_by_federation_url object['id']
        else
          raise "Unsupported object type for actor (#{object.class})"
        end
      end
    end

    def public_key
      ensure_key_pair_exists!
      self[:public_key]
    end

    def private_key
      ensure_key_pair_exists!
      self[:private_key]
    end

    def key_id
      "#{federated_url}#main-key"
    end

    private

    def ensure_key_pair_exists!
      return if self[:private_key].present? || !local?

      update!(generate_key_pair)
    end

    def generate_key_pair
      rsa_key = OpenSSL::PKey::RSA.new 2048
      cipher  = OpenSSL::Cipher.new('AES-128-CBC')
      {
        private_key: if Rails.application.credentials.secret_key_base
                       rsa_key.to_pem(cipher, Rails.application.credentials.secret_key_base)
                     else
                       rsa_key.to_pem
                     end,
        public_key:  rsa_key.public_key.to_pem,
      }
    end
  end
end
