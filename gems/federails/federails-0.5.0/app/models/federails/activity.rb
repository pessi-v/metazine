module Federails
  # Activities can be compared to a log of what happened in the Fediverse.
  #
  # Activities from local actors ends in the actors _outboxes_.
  # Activities form distant actors comes from the actor's _inbox_.
  # We try to only keep activities _from_ local actors, and external activities _targetting_ local actors.
  #
  # See also:
  #   - https://www.w3.org/TR/activitypub/#outbox
  #   - https://www.w3.org/TR/activitypub/#inbox
  class Activity < ApplicationRecord
    include Federails::HasUuid

    belongs_to :entity, polymorphic: true
    belongs_to :actor

    scope :feed_for, lambda { |actor|
      actor_ids = []
      Following.accepted.where(actor: actor).find_each do |following|
        actor_ids << following.target_actor_id
      end
      where(actor_id: actor_ids)
    }

    after_create_commit :post_to_inboxes

    # Determines the list of actors targeted by the activity
    #
    # @return [Array<Federails::Actor>]
    def recipients
      return [] unless actor.local?

      case entity_type
      when 'Federails::Following'
        [(action == 'Accept' ? entity.actor : entity.target_actor)]
      else
        actor.followers
      end
    end

    private

    def post_to_inboxes
      NotifyInboxJob.perform_later(self)
    end
  end
end
