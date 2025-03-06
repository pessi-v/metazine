module Federails
  module Client
    class ActorPolicy < Federails::FederailsPolicy
      def lookup?
        true
      end

      class Scope < Scope
        def resolve
          scope
        end
      end
    end
  end
end
