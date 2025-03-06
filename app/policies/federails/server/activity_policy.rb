module Federails
  module Server
    class ActivityPolicy < Federails::FederailsPolicy
      def outbox?
        true
      end
      
      # Define a scope that doesn't rely on current_user
      class Scope < Federails::FederailsPolicy::Scope
        def resolve
          # Return all activities regardless of user - this is for public outbox
          scope.all
        end
      end
    end
  end
end