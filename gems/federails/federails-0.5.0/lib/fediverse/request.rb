require 'json/ld'

module Fediverse
  class Request
    BASE_HEADERS = {
      'Content-Type' => 'application/json',
      'Accept'       => 'application/json',
    }.freeze

    def initialize(id)
      @id = id
    end

    # FIXME: Replace by `Webfinger.get_json` (move other method here as class method)
    def get
      Rails.logger.debug { "GET #{@id}" }
      @response = Faraday.get(@id, nil, BASE_HEADERS)
      response_to_json
    end

    class << self
      def get(id)
        new(id).get
      end

      # Dereferences a value
      #
      # @param value [String, Hash]
      #
      # @return [Hash, nil]
      def dereference(value)
        return value if value.is_a? Hash
        return get(value) if value.is_a? String

        raise "Unhandled object type #{value.class}"
      end
    end

    private

    def response_to_json
      begin
        body = JSON.parse @response.body
      rescue JSON::ParserError
        return
      end

      JSON::LD::API.compact body, body['@context']
    end
  end
end
