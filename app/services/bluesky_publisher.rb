# frozen_string_literal: true

require 'bskyrb'

# Service to publish Articles to Bluesky via our PDS
class BlueskyPublisher
  class AuthenticationError < StandardError; end
  class PublishError < StandardError; end

  def initialize
    @credentials = Rails.application.credentials.bluesky_pds
    raise "Bluesky PDS credentials not configured" unless @credentials

    @pds_url = @credentials[:pds_url]
    @handle = @credentials[:handle]
    @password = @credentials[:password]
  end

  # Get authenticated record manager
  def record_manager
    @record_manager ||= begin
      credentials = Bskyrb::Credentials.new(@handle, @password)
      session = Bskyrb::Session.new(credentials, @pds_url)
      Bskyrb::RecordManager.new(session)
    rescue => e
      error_msg = "Bluesky authentication failed: #{e.message}"
      Rails.logger.error error_msg
      raise AuthenticationError, error_msg
    end
  end

  # Publish an article to Bluesky
  # @param article [Article] The article to publish
  # @return [Hash] Response from Bluesky API
  def publish_article(article)
    text = format_article_text(article)

    result = record_manager.create_post(text)

    Rails.logger.info "Published article '#{article.title}' to Bluesky: #{result['uri']}"
    result
  rescue => e
    error_msg = "Failed to publish to Bluesky: #{e.message}"
    Rails.logger.error error_msg
    raise PublishError, error_msg
  end

  private

  # Format article for Bluesky post
  def format_article_text(article)
    text = "#{article.title}\n\n"

    if article.description.present?
      text += article.description.to_s.truncate(200)
      text += "\n\n"
    end

    # Add link if present
    text += article.url if article.url.present?

    # Bluesky has a 300 character limit for posts
    text.truncate(300)
  end
end
