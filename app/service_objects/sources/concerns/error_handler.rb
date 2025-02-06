# frozen_string_literal: true

module Sources
  module Concerns
    module ErrorHandler
      def handle_fetch_error(source, error_type, error: nil)
        error_messages = {
          connection_failed: 'Connection failed',
          invalid_url: 'Invalid URL',
          ssl_error: 'SSL Error',
          timeout: 'Timeout Error',
          redirect_limit_reached: 'Redirect limit reached',
          xml_parse_error: 'XML parsing error',
          internal_server_error: 'Internal server error (HTTP error 500)'
        }

        Rails.logger.error("#{error_messages[error_type]} for source: #{source&.name} (#{source&.url})")
        Rails.logger.error(error.message) if error

        source&.update(last_error_status: error_type.to_s)
      end
    end
  end
end
