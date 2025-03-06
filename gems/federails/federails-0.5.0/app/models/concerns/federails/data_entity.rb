require 'fediverse/inbox'

module Federails
  # Model concern to include in models for which data is pushed to the Fediverse and comes from the Fediverse.
  #
  # Once included, an activity will automatically be created upon
  #   - entity creation
  #   - entity updates
  #
  # Also, when properly configured, a handler is registered to transform incoming objects and create/update entities
  # accordingly.
  #
  # ## Pre-requisites
  #
  # Model must have a `federated_url` attribute:
  # ```rb
  # add_column :posts, :federated_url, :string, null: true, default: nil
  # ```
  #
  # ## Usage
  #
  # Include the concern in an existing model:
  #
  # ```rb
  # class Post < ApplicationRecord
  #   include Federails::DataEntity
  #   acts_as_federails_data options
  # end
  # ```
  module DataEntity
    extend ActiveSupport::Concern

    # Class methods automatically included in the concern.
    module ClassMethods
      # Configures the mapping between entity and Fediverse
      #
      # Model should have the following methods:
      # - `to_activitypub_object`, returning a valid ActivityPub object
      #
      # @param actor_entity_method [Symbol] Method returning an object responding to 'federails_actor', for local content
      # @param url_param [Symbol] Column name of the object ID that should be used in URLs. Defaults to +:id+
      # @param route_path_segment [Symbol] Segment used in Federails routes to display the ActivityPub representation.
      #   Defaults to the pluralized, underscored class name
      # @param handles [String] Type of ActivityPub object handled by this entity type
      # @param with [Symbol] Self class method that will handle incoming objects. Defaults to +:handle_incoming_fediverse_data+
      # @param filter_method [Symbol] Self class method that determines if an incoming object should be handled. Note
      #   that the first model for which this method returns true will be used. If left empty, the model CAN be selected,
      #   so define them if many models handle the same data type.
      # @param should_federate_method [Symbol] method to determine if an object should be federated. If the method returns false,
      #   no create/update activities will happen, and object will not be accessible at federated_url. Defaults to a method
      #   that always returns true.
      #
      # @example
      #   acts_as_federails_data handles: 'Note', with: :note_handler, route_path_segment: :articles, actor_entity_method: :user
      # rubocop:disable Metrics/ParameterLists
      def acts_as_federails_data(
        handles:,
        with: :handle_incoming_fediverse_data,
        route_path_segment: nil,
        actor_entity_method: nil,
        url_param: :id,
        filter_method: nil,
        should_federate_method: :default_should_federate?
      )
        route_path_segment ||= name.pluralize.underscore

        Federails::Configuration.register_data_type self,
                                                    route_path_segment:     route_path_segment,
                                                    actor_entity_method:    actor_entity_method,
                                                    url_param:              url_param,
                                                    handles:                handles,
                                                    with:                   with,
                                                    filter_method:          filter_method,
                                                    should_federate_method: should_federate_method

        Fediverse::Inbox.register_handler 'Create', handles, self, with
        Fediverse::Inbox.register_handler 'Update', handles, self, with
      end
      # rubocop:enable Metrics/ParameterLists

      # Instantiates a new instance from an ActivityPub object
      #
      # @param activitypub_object [Hash]
      #
      # @return [self]
      def new_from_activitypub_object(activitypub_object)
        new from_activitypub_object(activitypub_object)
      end

      # Creates or updates entity based on the ActivityPub activity
      #
      # @param activity_hash_or_id [Hash, String] Dereferenced activity hash or ID
      #
      # @return [self]
      def handle_incoming_fediverse_data(activity_hash_or_id)
        activity = Fediverse::Request.dereference(activity_hash_or_id)
        object = Fediverse::Request.dereference(activity['object'])

        entity = Federails::Utils::Object.find_or_create!(object)

        if activity['type'] == 'Update'
          entity.assign_attributes from_activitypub_object(object)

          # Use timestamps from attributes
          entity.save! touch: false
        end

        entity
      end
    end

    included do
      belongs_to :federails_actor, class_name: 'Federails::Actor'

      scope :local_federails_entities, -> { where federated_url: nil }
      scope :distant_federails_entities, -> { where.not(federated_url: nil) }

      before_validation :set_federails_actor
      after_create :create_federails_activity
      after_update :update_federails_activity
    end

    # Computed value for the federated URL
    #
    # @return [String]
    def federated_url
      return nil unless send(federails_data_configuration[:should_federate_method])
      return attributes['federated_url'] if attributes['federated_url'].present?

      path_segment = Federails.data_entity_configuration(self)[:route_path_segment]
      url_param = Federails.data_entity_configuration(self)[:url_param]
      Federails::Engine.routes.url_helpers.server_published_url(publishable_type: path_segment, id: send(url_param))
    end

    # Check whether the entity was created locally or comes from the Fediverse
    #
    # @return [Boolean]
    def local_federails_entity?
      attributes['federated_url'].blank?
    end

    def federails_data_configuration
      Federails.data_entity_configuration(self)
    end

    private

    def set_federails_actor
      return federails_actor if federails_actor.present?

      self.federails_actor = send(federails_data_configuration[:actor_entity_method])&.federails_actor if federails_data_configuration[:actor_entity_method]

      raise 'Cannot determine actor from configuration' unless federails_actor
    end

    def create_federails_activity
      ensure_federails_configuration!
      return unless local_federails_entity? && send(federails_data_configuration[:should_federate_method])

      Activity.create! actor: federails_actor, action: 'Create', entity: self
    end

    def update_federails_activity
      ensure_federails_configuration!
      return unless local_federails_entity? && send(federails_data_configuration[:should_federate_method])

      Activity.create! actor: federails_actor, action: 'Update', entity: self
    end

    def ensure_federails_configuration!
      raise("Entity not configured for #{self.class.name}. Did you use \"acts_as_federails_data\"?") unless Federails.data_entity? self
    end

    def default_should_federate?
      true
    end
  end
end
