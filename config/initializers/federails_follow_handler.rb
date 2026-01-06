# Custom Follow handler to properly handle Instance Actor follows
module Fediverse
  class Inbox
    class << self
      # Override the original handler to fix Instance Actor follow handling
      alias_method :original_handle_create_follow_request, :handle_create_follow_request

      def handle_create_follow_request(activity)
        Rails.logger.info "=== Processing Follow activity ==="
        Rails.logger.info "Actor: #{activity['actor']}"
        Rails.logger.info "Object: #{activity['object']}"
        Rails.logger.info "Activity ID: #{activity['id']}"

        begin
          # Extract the target actor URL from the activity object
          target_url = activity['object'].is_a?(Hash) ? activity['object']['id'] : activity['object']

          # Check if this is a follow to our instance actor
          instance_actor = InstanceActor.first
          if instance_actor && target_url_matches_instance_actor?(target_url, instance_actor)
            Rails.logger.info "=== Follow is for Instance Actor, handling specially ==="
            handle_instance_actor_follow(activity, instance_actor)
          else
            # Fall back to default handling for regular actors
            original_handle_create_follow_request(activity)
          end

          Rails.logger.info "=== Follow processed successfully ==="
        rescue => e
          Rails.logger.error "=== Follow processing failed ==="
          Rails.logger.error "Error: #{e.class} - #{e.message}"
          Rails.logger.error e.backtrace.first(10).join("\n")
          raise
        end
      end

      private

      def target_url_matches_instance_actor?(target_url, instance_actor)
        return false unless target_url.present?

        # Get the instance actor's federation URL
        instance_url = instance_actor.federails_actor.federated_url

        # Parse both URLs to compare them properly
        target_uri = URI.parse(target_url)
        instance_uri = URI.parse(instance_url)

        # Compare the UUID part (last segment of the path)
        target_uuid = target_uri.path.split('/').last
        instance_uuid = instance_uri.path.split('/').last

        # URLs match if they have the same UUID and path structure
        target_uuid == instance_uuid && target_uri.path.include?('/federation/actors/')
      rescue URI::InvalidURIError => e
        Rails.logger.error "Invalid URI in follow target comparison: #{e.message}"
        false
      end

      def handle_instance_actor_follow(activity, instance_actor)
        # Find or create the follower actor
        actor = Federails::Actor.find_or_create_by_object(activity['actor'])
        target_actor = instance_actor.federails_actor

        # Create the follow relationship
        follow = Federails::Following.create!(
          actor: actor,
          target_actor: target_actor,
          federated_url: activity['id']
        )

        Rails.logger.info "=== Created follow relationship for Instance Actor ==="
        Rails.logger.info "Follower: #{actor.username} (#{actor.federated_url})"
        Rails.logger.info "Target: Instance Actor (#{target_actor.federated_url})"
      end
    end
  end
end
