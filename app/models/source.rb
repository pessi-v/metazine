# frozen_string_literal: true

class Source < ApplicationRecord
  validates :name, :url, presence: true
  validates :name, :url, uniqueness: true
  validates :name, exclusion:
    {
      in: %(search source sources articles article user users list fetch_feeds fetch_feed reader .well-known editor following followers),
      message: "%<value>s is a reserved keyword"
    }

  scope :active, -> { where(active: true) }

  has_many :articles, dependent: :destroy
  before_create :add_description_and_image
  after_update :update_articles_source_name, if: :saved_change_to_name?

  def consume_feed
    Sources::FeedFetcher.new.consume(self)
  end

  def self.consume_all
    Sources::FeedFetcher.new.consume_all
  end

  def reset_articles
    articles.destroy_all
    update(last_modified: nil, etag: nil, last_built: nil)
    consume_feed
  end

  private

  def add_description_and_image
    uri = URI(url)
    response = Faraday.get(uri.origin) do |req|
      req.options.timeout = 10
      req.options.open_timeout = 5
    end

    return if response.body.blank?

    ogp = OGP::OpenGraph.new(response.body, required_attributes: [])

    # Assign OGP data if available
    # OGP image is an OpenStruct with url, width, height, type properties
    self.image_url = ogp.image.url if ogp.image.present? && ogp.image.respond_to?(:url)
    self.description = ogp.description if ogp.description.present? && description.blank?

    Rails.logger.info "Successfully fetched OGP data for #{url}"
  rescue OGP::MalformedSourceError => e
    Rails.logger.info "Source URL does not have valid OGP metadata: #{e.message}"
  rescue Faraday::Error, URI::InvalidURIError, SocketError, Timeout::Error => e
    Rails.logger.warn "Failed to fetch OGP data for #{url}: #{e.class} - #{e.message}"
  rescue StandardError => e
    Rails.logger.error "Unexpected error fetching OGP data for #{url}: #{e.class} - #{e.message}"
  end

  def update_articles_source_name
    articles.update_all(source_name: name)
  end
end
