# Enhanced Follow handler with logging
# Now that webfinger uses signed requests, the default handler should work for all actors
module Fediverse
  class Inbox
    class << self
      # Add logging to the default follow handler
      alias_method :original_handle_create_follow_request, :handle_create_follow_request

      def handle_create_follow_request(activity)
        Rails.logger.info "=== Processing Follow activity ==="
        Rails.logger.info "Actor: #{activity['actor']}"
        Rails.logger.info "Object: #{activity['object']}"
        Rails.logger.info "Activity ID: #{activity['id']}"

        begin
          # The default handler now works with signed requests via the webfinger patch
          original_handle_create_follow_request(activity)
          Rails.logger.info "=== Follow processed successfully ==="
        rescue => e
          Rails.logger.error "=== Follow processing failed ==="
          Rails.logger.error "Error: #{e.class} - #{e.message}"
          Rails.logger.error e.backtrace.first(10).join("\n")
          raise
        end
      end
    end
  end
end
