require 'fediverse/inbox'

module Federails
  module Server
    class ActivitiesController < Federails::ServerController
      before_action :set_activity, only: [:show]
      # before_action :skip_authorization, only: [:outbox]

      # GET /federation/activities
      # GET /federation/actors/1/outbox.json
      def outbox
        # authorize Federails::Activity, policy_class: Federails::Server::ActivityPolicy

        @actor            = Actor.find_param(params[:actor_id])
        @activities       = policy_scope(Federails::Activity, policy_scope_class: Federails::Server::ActivityPolicy::Scope).where(actor: @actor).order(created_at: :desc)
        @total_activities = @activities.count
        @activities       = @activities.page(params[:page])
      end

      # GET /federation/actors/1/activities/1.json
      def show; end

      # POST /federation/actors/1/inbox
      def create
        skip_authorization

        payload = payload_from_params
        return head :unprocessable_entity unless payload

        if Fediverse::Inbox.dispatch_request(payload)
          head :created
        else
          head :unprocessable_entity
        end
      end

      private

      def current_user
        User.last
      end

      # Use callbacks to share common setup or constraints between actions.
      def set_activity
        @activity = Actor.find_param(params[:actor_id]).activities.find_param(params[:id])
        authorize @activity, policy_class: Federails::Server::ActivityPolicy
      end

      # Only allow a list of trusted parameters through.
      def activity_params
        params.fetch(:activity, {})
      end

      def payload_from_params
        payload_string = request.body.read
        request.body.rewind if request.body.respond_to? :rewind

        begin
          payload = JSON.parse(payload_string)
        rescue JSON::ParserError
          return
        end

        hash = JSON::LD::API.compact payload, payload['@context']
        validate_payload hash
      end

      def validate_payload(hash)
        return unless hash['@context'] && hash['id'] && hash['type'] && hash['actor'] && hash['object']

        hash
      end
    end
  end
end
