# frozen_string_literal: true

module Sources
  class FeedFetcher
    include Concerns::ErrorHandler
    include Concerns::HTTPRequestsHelper
    
    def consume_all
      Rails.logger.info("Starting feed consumption for all active sources")
      Source.active.each { |source| consume(source) }
      Rails.logger.info("Completed feed consumption for all active sources")
    end

    def consume(source)
      Rails.logger.info("Processing feed for source: #{source.name}")

      response = make_request(source: source)
      if response.status == 500
        handle_fetch_error(source, :internal_server_error)
        return
      end

      if response.status == 304
        # Happy path: feed not modified
        Rails.logger.info("Feed not modified for source: #{source.name}")
        source.update(last_error_status: nil)
        return
      end

      feed = parse_feed(response, source: source)

      if feed_not_modified?(response, feed, source)
        # Happy path: feed not modified
        # Sometimes the server doesn't handle etag or last-modified headers,
        # but the feed still contains a tag that tells you when it was last changed
        Rails.logger.info("Feed not modified for source: #{source.name}")
        source.update(last_error_status: nil)
        return
      end

      process_feed(feed, source, response)
    end

    # # Debug method for development use
    # def debug(url)
    #   response = make_request(url: url)
    #   return unless response

    #   Rails.logger.debug("Debug request for URL: #{url}")
    #   Rails.logger.debug("Response status: #{response.status}")
    #   Rails.logger.debug("Response headers: #{response.headers}")
      
    #   parse_feed(response)
    # end

    private

    def make_request(source: nil, url: nil)
      request_url = source&.url || url
      return unless valid_url?(request_url)

      connection = connection(source: source, url: request_url)
      connection.get
    rescue Faraday::ConnectionFailed => e
      handle_fetch_error(source, :connection_failed, e)
    rescue URI::InvalidURIError => e
      handle_fetch_error(source, :invalid_url, e)
    rescue Faraday::SSLError => e
      handle_fetch_error(source, :ssl_error, e)
    rescue Faraday::TimeoutError => e
      handle_fetch_error(source, :timeout, e)
    rescue Faraday::FollowRedirects::RedirectLimitReached => e
      handle_fetch_error(source, :redirect_limit_reached, e)
    end

    def valid_url?(url)
      uri = URI.parse(url)
      uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
    rescue URI::InvalidURIError
      false
    end

    # def response_status_ok?(response, source)
    #   if response.status == 500
    #     Rails.logger.info("Internal Server Error for source: #{source.name}")
    #     return false
    #   end
      
    #   if response.status == 304
    #     Rails.logger.info("Feed not modified for source: #{source.name}")
    #     return false
    #   end
      
    #   true
    # end

    def feed_not_modified?(response, feed, source)
      if (response.headers['last-modified'] && response.headers['last-modified'] == source.last_modified) ||
          (feed.respond_to?(:last_built) && feed.last_built == source.last_built) ||
          (feed.last_modified == source.last_modified)
        return true
      else
        return false
      end
    end

    def parse_feed(response, source: nil)
      Feedjira.parse(response.body.force_encoding('utf-8'))
    rescue Feedjira::NoParserAvailable => e
      handle_fetch_error(source, :xml_parse_error, e)
      nil
    end

    def process_feed(feed, source, response)
      if feed.nil?
        handle_fetch_error(source, :feed_not_available)
        return
      elsif
        feed.entries.empty?
        handle_fetch_error(source, :empty_feed)
        return
      end
      
      process_entries(feed.entries, source)
      update_source_metadata(source, feed, response)
      true
    end

    # def handle_empty_feed(source, feed)
    #   message = feed.nil? ? 'Feed not available' : 'Feed appears to be empty'
    #   source.update(last_error_status: message)
    #   Rails.logger.warn("#{message} for source: #{source.name}")
    # end

    def process_entries(entries, source)
      Rails.logger.info("Processing #{entries.count} entries for source: #{source.name}")
      entries.each do |entry|
        Articles::CreateService.new(source, entry).create_article
      end
    end

    def update_source_metadata(source, feed, response)
      source.assign_attributes(
        last_modified: response.headers['last-modified'] || feed.last_modified,
        etag: response.headers['etag'],
        last_built: feed.respond_to?(:last_built) ? feed.last_built : nil,
        last_error_status: nil
      )
      source.save if source.changed?
    end
  end
end