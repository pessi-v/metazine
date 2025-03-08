module Federails
  module Client
    class ActivityPolicy < Federails::FederailsPolicy
      def feed?
        user_with_actor?
      end
    end
  end
end
