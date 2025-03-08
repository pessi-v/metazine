module Federails
  module Server
    class ActorPolicy < Federails::FederailsPolicy
      def show?
        @record.local?
      end

      def following?
        true
      end

      def followers?
        true
      end

      class Scope < Scope
        def resolve
          scope.local
        end
      end
    end
  end
end
