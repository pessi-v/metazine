# frozen_string_literal: true

class FeedFetcherJob < ApplicationJob
  queue_as :default

  def perform
    job_run = JobRun.create!(
      job_name: "FeedFetcherJob",
      started_at: Time.current
    )

    Rails.logger.info "FeedFetcherJob started at #{Time.current}"

    begin
      Sources::FeedFetcher.new.consume_all

      job_run.update!(
        finished_at: Time.current,
        success: true
      )

      Rails.logger.info "FeedFetcherJob finished at #{Time.current}, broadcasting refresh"
    rescue => e
      job_run.update!(
        finished_at: Time.current,
        success: false,
        error_message: "#{e.class}: #{e.message}\n#{e.backtrace.first(5).join("\n")}"
      )

      Rails.logger.error "FeedFetcherJob failed: #{e.message}"
      raise
    end

    # Broadcast a Turbo Stream to refresh the page when done
    Turbo::StreamsChannel.broadcast_refresh_to("feed_updates")

    Rails.logger.info "Broadcast complete"
  end
end
