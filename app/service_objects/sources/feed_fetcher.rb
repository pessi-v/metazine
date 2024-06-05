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
      connection = Faraday.new(
        url: source.url,
        headers: {
          'If-Modified-Since': source.last_modified,
          'If-None-Match': source.etag
        },
        ssl: { verify: false }
      ) do |faraday|
        faraday.use FaradayMiddleware::FollowRedirects
        faraday.adapter :net_http # not sure if this is needed/helpful
      end
      
      response = connection.get

      # 304: Not Modified
      return if response.status == 304

      return if response.headers['last-modified'] && response.headers['last-modified'] == source.last_modified

      feed = Feedjira.parse(response.body)

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
    rescue Feedjira::NoParserAvailable => e
      puts source.name
      puts source.url
      puts e
      puts response.status
      puts response.headers
      puts "XML DIDN'T WORK"
      source.update(last_error_status: 'xml_parse_error')
    rescue Faraday::ConnectionFailed => e
      puts source.name
      puts source.url
      puts e
      puts "URL DIDN'T WORK"
      source.update(last_error_status: 'connection_failed')
    rescue URI::InvalidURIError => e
      puts source.name
      puts source.url
      puts e
      puts 'INVALID URL ! ! ! ! ! ! ! ! !'
      source.update(last_error_status: 'invalid_url')
    rescue Faraday::SSLError => e
      puts source.name
      puts source.url
      puts e
      puts 'SSL ERROR ! ! ! ! ! ! ! ! !'
      source.update(last_error_status: 'ssl_error')
    rescue Faraday::TimeoutError => e
      puts source.name
      puts source.url
      puts e
      puts 'TIMEOUT ERROR'
      source.update(last_error_status: 'timeout')
    rescue FaradayMiddleware::RedirectLimitReached => e
      puts source.name
      puts source.url
      puts e
      puts 'REDIRECT LIMIT REACHED'
      source.update(last_error_status: 'redirect_limit_reached')
    end

    def debug(url)
      connection = Faraday.new(url: url, ssl: { verify: false }) do |faraday|
        faraday.use FaradayMiddleware::FollowRedirects
      end

      response = connection.get
      binding.break
      feed = Feedjira.parse(response.body)
    end
  end
end
