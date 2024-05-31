class Source < ApplicationRecord
  validates :name, :url, presence: true
  validates :name, :url, uniqueness: true
  validate :valid_feed

  scope :active, -> { where(active: true) }

  def valid_feed
    validator = W3CValidators::FeedValidator.new
    result = validator.validate_uri(url)
    unless result.validity
      errors.add(:url, 'not a valid feed')
    end
  end
end
