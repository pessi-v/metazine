module Federails
  class ServerController < ::ActionController::Base # rubocop:disable Rails/ApplicationController
    include Pundit::Authorization

    after_action :verify_authorized

    protect_from_forgery with: :null_session
    helper Federails::ServerHelper

    rescue_from ActiveRecord::RecordNotFound, with: :error_not_found

    private

    def pundit_user
      User.last
    end

    def error_fallback(exception, fallback_message, status)
      message = exception&.message || fallback_message
      respond_to do |format|
        format.jrd { head status }
        format.xrd { head status }
        format.activitypub { head status }
        format.nodeinfo { head status }
        format.json { render json: { error: message }, status: status }
        format.html { raise exception }
      end
    end

    def error_not_found(exception = nil)
      error_fallback(exception, 'Resource not found', :not_found)
    end
  end
end
