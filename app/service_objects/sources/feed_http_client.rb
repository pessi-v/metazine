# frozen_string_literal: true

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
        faraday.use FaradayMiddleware::FollowRedirects, limit: 5
        faraday.adapter :net_http
      end
    end
  end
end