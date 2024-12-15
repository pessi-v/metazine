# frozen_string_literal: true

require 'faraday/follow_redirects'

module Sources
  class FeedHttpClient
    def self.connection(url, headers = {})
      Faraday.new(
        url: url,
        headers: headers,
        ssl: { verify: false },
        request: { 
          timeout: 30,           # Total timeout in seconds
          open_timeout: 10,      # Connection open timeout
          read_timeout: 20       # Read timeout
        }
      ) do |faraday|
        faraday.request :url_encoded # encodes as "application/x-www-form-urlencoded" if not already encoded or of another type
        faraday.response :follow_redirects, limit: 5 # some feeds are behind a redirect
        faraday.adapter :net_http
      end
    end
  end
end