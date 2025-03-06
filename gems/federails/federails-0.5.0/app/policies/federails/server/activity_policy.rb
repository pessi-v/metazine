module Federails
  module Server
    class ActivityPolicy < Federails::FederailsPolicy
      def outbox?
        true
      end
    end
  end
end
