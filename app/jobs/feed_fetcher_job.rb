# frozen_string_literal: true

class FeedFetcherJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "FeedFetcherJob started at #{Time.current}"

    Sources::FeedFetcher.new.consume_all

    Rails.logger.info "FeedFetcherJob finished at #{Time.current}, broadcasting refresh"

    # Broadcast a Turbo Stream to refresh the page when done
    Turbo::StreamsChannel.broadcast_refresh_to("feed_updates")

    Rails.logger.info "Broadcast complete"
  end
end
