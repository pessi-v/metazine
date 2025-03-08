module Federails
  module Utils
    # Methods to manipulate incoming objects
    class Object
      class << self
        # Finds data from an object or its ID.
        #
        # When data exists locally, the entity is returned.
        # For distant data, a new instance is returned unless the target does not exist.
        #
        # @param object_or_id [String, Hash] String identifier or incoming object
        #
        # @return [ApplicationRecord, nil] Entity or nil when invalid/not found
        def find_or_initialize(object_or_id)
          federated_url = object_or_id.is_a?(Hash) ? object_or_id['id'] : object_or_id

          route = local_route(federated_url)
          return from_local_route(route) if route

          from_distant_server(object_or_id)
        end

        # Finds or initializes an entity from an ActivityPub object or id
        #
        # @see .find_or_initialize
        #
        # @param object_or_id [String, Hash] String identifier or incoming object
        #
        # @return [ApplicationRecord, nil] Entity or nil when invalid/not found
        def find_or_initialize!(object_or_id)
          entity = find_or_initialize object_or_id
          raise ActiveRecord::RecordNotFound unless entity

          entity
        end

        # Finds or create an entity from an ActivityPub object or id
        #
        # Note that the data transformer MUST return timestamps from the ActivityPub object if used on the model,
        # as they won't be set automatically.
        #
        # @see .find_or_initialize!
        #
        # @param object_or_id [String, Hash] String identifier or incoming object
        #
        # @return [ApplicationRecord, nil] Entity or nil when invalid/not found
        def find_or_create!(object_or_id)
          entity = find_or_initialize! object_or_id
          return entity if entity.persisted?

          entity.save!(touch: false)
          entity
        end

        # Returns the timestamps to use from an ActivityPub object
        #
        # @param hash [Hash] ActivityPub object
        #
        # @return [Hash] Hash with timestamps
        def timestamp_attributes(hash)
          {
            created_at: hash['published'] ||= Time.current,
            updated_at: hash['updated'].presence || hash['published'],
          }
        end

        private

        def local_route(url)
          route = Utils::Host.local_route(url)

          return nil unless route && route[:controller] == 'federails/server/published' && route[:action] == 'show'

          route
        end

        def from_local_route(route)
          config = Federails.data_entity_handled_on route[:publishable_type]
          return unless config

          config[:class]&.find_by(config[:url_param] => route[:id])
        rescue ActiveRecord::RecordNotFound
          nil
        end

        def from_distant_server(federated_url)
          hash = Fediverse::Request.dereference(federated_url)
          return unless hash

          handler = Federails.data_entity_handler_for hash
          return unless handler

          entity = handler[:class].find_by federated_url: hash['id']
          return entity if entity

          entity = handler[:class].new_from_activitypub_object(hash)
          return unless entity

          entity.federails_actor = Federails::Actor.find_or_create_by_object hash['attributedTo'] if entity && !entity.federails_actor

          entity
        end
      end
    end
  end
end
