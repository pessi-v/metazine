gem 'faraday-follow_redirects'

module Sources
  module Concerns
    module HTTPRequestsHelper
      def connection(source: nil, url: nil)
        connection = Faraday.new(
          url: url,
          headers: {
            'If-Modified-Since': source&.last_modified,
            'If-None-Match': source&.etag,
            'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:127.0) Gecko/20100101 Firefox/127.0'
          },
          ssl: { verify: false }
        ) do |faraday|
          faraday.request :url_encoded # encodes as "application/x-www-form-urlencoded" if not already encoded or of another type
          faraday.response :follow_redirects, limit: 5 # some feeds are behind a redirect
          faraday.adapter :net_http # not sure if this is needed/helpful
        end
      end
    end
  end
end

