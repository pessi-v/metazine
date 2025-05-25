# frozen_string_literal: true

module Sources
  class FeedFetcher
    include Concerns::ErrorHandler
    include Concerns::HTTPRequestsHelper

    def consume_all
      Rails.logger.info("Starting feed consumption for all active sources")
      Source.active.each do |source|
        consume(source)
      rescue => e
        Rails.logger.error("Error processing source #{source.name}: #{e.message}")
        # Optionally record the error in the source
        source.update(last_error_status: "processing_error: #{e.message}") if source.respond_to?(:update)
      end
      Rails.logger.info("Completed feed consumption for all active sources")
    end

    def consume(source)
      Rails.logger.info("Processing feed for source: #{source.name}")

      response = make_request(source: source)
      # binding.break

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

      if response.status == 404
        # Sad path: feed not found
        Rails.logger.info("Feed not found for source: #{source.name}")
        handle_fetch_error(source, :not_found)
        return
      end

      response = decode_response(response)
      feed = parse_feed(response, source: source)
      return unless feed

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

    def decode_response(response)
      return response unless response.headers["Content-Encoding"]

      decoded_body = case response.headers["Content-Encoding"].downcase
      when "gzip"
        Zlib::GzipReader.new(StringIO.new(response.body)).read
      when "deflate"
        Zlib::Inflate.inflate(response.body)
      when "br"
        Brotli.inflate(response.body)
      when "zstd"
        Zstd.decode(response.body)
      when "compress"
        Zlib::Inflate.inflate(response.body)
      else
        response.body
      end

      # Create a new response object with the decoded body
      env = response.env.dup
      env.response_body = decoded_body
      Faraday::Response.new(env)
    rescue => e
      Rails.logger.error "Failed to decode response body: #{e.message}"
      response
    end

    def feed_not_modified?(response, feed, source)
      if (response.headers["last-modified"] && response.headers["last-modified"] == source.last_modified) ||
          (feed.respond_to?(:last_built) && feed.last_built.present? && feed.last_built == source.last_built) ||
          (feed.last_modified == source.last_modified)
        true
      else
        false
      end
    end

    def parse_feed(response, source: nil)
      feed = Feedjira.parse(response.body.dup.force_encoding("utf-8"))

      if feed.nil?
        handle_fetch_error(source, :feed_not_available)
        return
      elsif feed.entries.empty?
        handle_fetch_error(source, :empty_feed)
        return
      end

      feed

    # response probably does not return an actual feed
    rescue Feedjira::NoParserAvailable => e
      handle_fetch_error(source, :xml_parse_error, e)
      false
    end

    def process_feed(feed, source, response)
      process_entries(feed.entries, source)
      update_source_metadata(source, feed, response)
      true
    rescue => e
      Rails.logger.error("Failed to process feed for source #{source.name}: #{e.message}")
      handle_fetch_error(source, :process_feed_error, e)
      false
    end

    def process_entries(entries, source)
      Rails.logger.info("Processing #{entries.count} entries for source: #{source.name}")
      entries.each do |entry|
        Articles::CreateService.new(source, entry).create_article
      rescue ActiveRecord::RecordNotUnique
        Rails.logger.info "Skipping duplicate article: #{entry.url}"
        next
      end

      true
    end

    def update_source_metadata(source, feed, response)
      source.assign_attributes(
        last_modified: response.headers["last-modified"] || feed.last_modified,
        etag: response.headers["etag"],
        last_built: feed.respond_to?(:last_built) ? feed.last_built : nil,
        last_error_status: nil
      )
      source.save if source.changed?
    end
  end
end
