class Source < ApplicationRecord
  validates :name, :url, presence: true
  validates :name, :url, uniqueness: true
  validate :valid_feed

  scope :active, -> { where(active: true) }

  def valid_feed
    # Check feed validity
    validator = W3CValidators::FeedValidator.new
    result = validator.validate_uri(url)

    # Check if feed can be parsed for entries
    connection = Faraday.new(url: url, ssl: { verify: false }) do |faraday|
      faraday.use FaradayMiddleware::FollowRedirects
    end
    response = connection.get
    feed = Feedjira.parse(response.body)

    if !result.validity && feed.entries.empty?
      errors.add(:url, 'not a valid feed')
    end
  end
end
