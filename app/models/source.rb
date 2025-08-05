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

  def self.consume_all_feeds
    Sources::FeedFetcher.new.consume_all
  end

  def consume_feed
    Sources::FeedFetcher.new.consume(self)
  end

  def reset_articles
    articles.destroy_all
    update(last_modified: nil, etag: nil, last_built: nil)
    consume_feed
  end

  private

  def add_description_and_image
    uri = URI(url)
    response = Faraday.get(uri.origin)
    return if response.body.blank?
    ogp = OGP::OpenGraph.new(response.body, required_attributes: [])

    ogp&.image
    ogp&.description
  rescue OGP::MalformedSourceError
    Rails.logger.info "source url does not have ogp metadata"
    nil
  end

  def update_articles_source_name
    articles.update_all(source_name: name)
  end
end
