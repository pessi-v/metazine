module Federails
  module Client
    class ActorsController < Federails::ClientController
      before_action :set_actor, only: [:show]

      # GET /app/actors
      # GET /app/actors.json
      def index
        authorize Federails::Actor, policy_class: Federails::Client::ActorPolicy

        @actors = policy_scope(Federails::Actor, policy_scope_class: Federails::Client::ActorPolicy::Scope).all
        @actors = @actors.local if params[:local_only]
      end

      # GET /app/actors/1
      # GET /app/actors/1.json
      def show; end

      # GET /app/explorer/lookup
      # GET /app/explorer/lookup.json
      def lookup
        @actor = Federails::Actor.find_by_account account_param
        authorize @actor, policy_class: Federails::Client::ActorPolicy
        render :show
      end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_actor
        @actor = Federails::Actor.find_param(params[:id])
        authorize @actor, policy_class: Federails::Client::ActorPolicy
      end

      def account_param
        params.require('account')
      end
    end
  end
end
