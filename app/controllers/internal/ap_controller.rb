class Internal::ApController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :verify_internal_secret

  def create
    payload = JSON.parse(request.body.read)
    type    = payload["type"]
    raw     = payload["raw"]

    case type
    when "Create"
      ActivityPub::NoteActivityHandler.handle_create_note(raw)
    when "Update"
      ActivityPub::NoteActivityHandler.handle_update_note(raw)
    when "Delete"
      ActivityPub::NoteActivityHandler.handle_delete_note(raw)
    when "Announce"
      Rails.logger.info "[Internal::ApController] Announce from #{payload["actorUrl"]} — not yet handled"
    else
      Rails.logger.warn "[Internal::ApController] Unknown activity type: #{type}"
    end

    head :ok
  rescue JSON::ParserError
    head :bad_request
  rescue => e
    Rails.logger.error "[Internal::ApController] #{e.class}: #{e.message}\n#{e.backtrace.first(5).join("\n")}"
    head :unprocessable_entity
  end

  private

  def verify_internal_secret
    expected = ENV["INTERNAL_SECRET"]
    return head(:unauthorized) if expected.blank?

    token = request.headers["Authorization"]&.delete_prefix("Bearer ")
    head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(token.to_s, expected)
  end
end
