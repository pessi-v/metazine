module Federails
  module Server
    class ActorsController < Federails::ServerController
      before_action :set_actor, only: [:show, :followers, :following]

      # GET /federation/actors/1
      # GET /federation/actors/1.json
      def show; end

      # GET /federation/actors/:id/followers
      # GET /federation/actors/:id/followers.json
      def followers
        @actors = @actor.followers.order(created_at: :desc)
        followings_queries
      end

      # GET /federation/actors/:id/followers
      # GET /federation/actors/:id/followers.json
      def following
        @actors = @actor.follows.order(created_at: :desc)
        followings_queries
      end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_actor
        @actor = Actor.find_param(params[:id])
        authorize @actor, policy_class: Federails::Server::ActorPolicy
      end

      def followings_queries
        @total_actors = @actors.count
        @actors       = @actors.page(params[:page])
      end
    end
  end
end
