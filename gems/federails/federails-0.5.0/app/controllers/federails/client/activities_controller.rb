module Federails
  module Client
    class ActivitiesController < Federails::ClientController
      before_action :authenticate_user!, only: [:feed]
      before_action :authorize_action!

      # GET /app/activities
      # GET /app/activities.json
      def index
        @activities = policy_scope(Federails::Activity, policy_scope_class: Federails::Client::ActivityPolicy::Scope).all
        @activities = @activities.where actor: Actor.find_param(params[:actor_id]) if params[:actor_id]
      end

      # GET /app/feed
      # GET /app/feed.json
      def feed
        @activities = Activity.feed_for(current_user.federails_actor)
      end

      private

      def authorize_action!
        authorize(Federails::Activity, policy_class: Federails::Client::ActivityPolicy)
      end
    end
  end
end
