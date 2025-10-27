# Wrap federails Follow handler with better error logging
module Fediverse
  class Inbox
    class << self
      # Override the original handler with error logging
      alias_method :original_handle_create_follow_request, :handle_create_follow_request

      def handle_create_follow_request(activity)
        Rails.logger.info "=== Processing Follow activity ==="
        Rails.logger.info "Actor: #{activity['actor']}"
        Rails.logger.info "Object: #{activity['object']}"
        Rails.logger.info "Activity ID: #{activity['id']}"

        begin
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
