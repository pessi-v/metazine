# frozen_string_literal: true

module Sources
  class FeedFetcher
    def initialize
      # @regions = JSON.parse(File.read('lib/countries.json'))
      # @countries = @regions.map { |region| region[1] }.flatten
      # @country_classifier = FastText.load_model('lib/en_country_classifier_model.bin')
    end

    def consume_all
      Source.active.each do |source|
        consume(source)
      end
    end

    def consume(source)
      response = make_request(source: source)
      return unless response

      # Internal Server Error
      return if response.status == 500

      # 304: Not Modified
      return if response.status == 304
      return if response.headers['last-modified'] && response.headers['last-modified'] == source.last_modified

      feed = parse_feed(response, source: source)

      if feed.nil?
        source.update(last_error_status: 'feed not available for some reason')
        return "feed not available for some reason! Status: #{response.status} Source: #{source.name}"
      end

      if feed.entries.empty?
        source.update(last_error_status: 'Feed appears to be empty')
        return "Feed Appears to be empty! Status: #{response.status} Source: #{source.name}"
      end

      feed.entries.each do |entry|
        # Articles::CreateService.new(source, entry, @regions, @countries, @country_classifier).create_article
        Articles::CreateService.new(source, entry).create_article
      end

      source.last_modified = response.headers['last-modified'] if response.headers['last-modified'].present?
      source.etag = response.headers['etag'] if response.headers['etag'].present?
      source.last_error_status = nil
      source.save if source.changed?
    end

    def make_request(source: nil, url: nil)
      connection = Faraday.new(
        url: source&.url || url,
        headers: {
          'If-Modified-Since': source&.last_modified,
          'If-None-Match': source&.etag
        },
        ssl: { verify: false }
      ) do |faraday|
        faraday.use FaradayMiddleware::FollowRedirects
        faraday.adapter :net_http # not sure if this is needed/helpful
      end
      
      response = connection.get

      if response.status == 500
        source.update(last_error_status: 'Internal Server Error (500)') if source
      end

      response

    rescue Faraday::ConnectionFailed => e
      puts source.name if source
      puts source.url if source
      puts e
      puts "URL DIDN'T WORK"
      source.update(last_error_status: 'connection_failed') if source
      return
    rescue URI::InvalidURIError => e
      puts source.name if source
      puts source.url if source
      puts e
      puts 'INVALID URL'
      source.update(last_error_status: 'invalid_url') if source
      return
    rescue Faraday::SSLError => e
      puts source.name if source
      puts source.url if source
      puts e
      puts 'SSL ERROR'
      source.update(last_error_status: 'ssl_error') if source
      return
    rescue Faraday::TimeoutError => e
      puts source.name if source
      puts source.url if source
      puts e
      puts 'TIMEOUT ERROR'
      source.update(last_error_status: 'timeout') if source
      return
    rescue FaradayMiddleware::RedirectLimitReached => e
      puts source.name if source
      puts source.url if source
      puts e
      puts 'REDIRECT LIMIT REACHED'
      source.update(last_error_status: 'redirect_limit_reached') if source
      return
    end

    def parse_feed(response, source: nil)
      Feedjira.parse(response.body.force_encoding('utf-8'))

    rescue Feedjira::NoParserAvailable => e
      puts source.name if source
      puts source.url if source
      puts e
      puts response.status
      puts response.headers
      puts "XML DIDN'T WORK"
      source.update(last_error_status: 'xml_parse_error') if source
      return
    end

    def debug(url)
      response = make_request(url: url)

      binding.break
      feed = parse_feed(response)
    end
  end
end
