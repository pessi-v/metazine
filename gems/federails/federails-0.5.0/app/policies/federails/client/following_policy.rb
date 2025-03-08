module Federails
  module Client
    class FollowingPolicy < Federails::FederailsPolicy
      def show?
        in_following?
      end

      def destroy?
        in_following?
      end

      def accept?
        in_following? && @record.target_actor_id == @user.federails_actor.id
      end

      def follow?
        create?
      end

      class Scope < Scope
        def resolve
          scope.with_actor(@user.federails_actor)
        end
      end

      private

      def in_following?
        return false unless user_with_actor?

        @record.actor_id == @user.federails_actor&.id || @record.target_actor_id == @user.federails_actor&.id
      end
    end
  end
end
