module Federails
  module Server
    class FollowingsController < Federails::ServerController
      before_action :set_following, only: [:show]

      # GET /federation/actors/1/followings/1.json
      def show; end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_following
        actor = Actor.find_param(params[:actor_id])
        @following = Following.find_by!(actor: actor, uuid: params[:id])
        authorize @following, policy_class: Federails::Server::FollowingPolicy
      end
    end
  end
end
