class Source < ApplicationRecord
  validates :name, :url, presence: true
  validates :name, :url, uniqueness: true
  validate :valid_feed

  scope :active, -> { where(active: true) }

  has_many :articles, dependent: :destroy
  after_update :update_articles_source_name, if: :saved_change_to_name?

  def valid_feed
    # Check feed validity
    validator = W3CValidators::FeedValidator.new
    result = validator.validate_uri(url)

    # Check if feed can be parsed for entries
    feed_fetcher = Sources::FeedFetcher.new

    response = feed_fetcher.make_request(url: url)
    feed = feed_fetcher.parse_feed(response)

    if !feed || (!result.validity && feed.entries.empty?)
      errors.add(:url, 'not a valid feed')
    end

  rescue Net::HTTPFatalError => e
    update(last_error_status: 'Internal Server Error (500)')
    return
  end

  private

  def update_articles_source_name
    articles.update_all(source_name: name)
  end
end
