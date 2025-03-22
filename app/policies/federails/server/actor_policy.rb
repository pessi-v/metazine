module Federails
  module Server
    class ActorPolicy < ApplicationPolicy
      # The 'show' action doesn't require authentication
      def show?
        true # This allows anyone to access the show action
      end
      
      # Define other actions as needed, with appropriate restrictions
      # def index?
      #   # Your logic for index action
      #   user.present? # Example: only authenticated users can access index
      # end
      
      # Add other controller actions as needed
    end
  end
end