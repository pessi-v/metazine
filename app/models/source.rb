class Source < ApplicationRecord
  validates :name, :url, presence: true
  validates :name, :url, uniqueness: true
  # validate :valid_feed, on: :create

  scope :active, -> { where(active: true) }

  has_many :articles, dependent: :destroy
  before_create :add_description_and_image
  after_update :update_articles_source_name, if: :saved_change_to_name?

  # def valid_feed
    # Check feed validity
    # validator = W3CValidators::FeedValidator.new
    # result = validator.validate_uri(url)

    # Check if feed can be parsed for entries
    # feed_fetcher = Sources::FeedFetcher.new

    # response = feed_fetcher.make_request(url: url)
    # feed = feed_fetcher.parse_feed(response)

    # if !feed || (!result.validity && feed.entries.empty?)
    #   errors.add(:url, 'not a valid feed')
    # end

  
  # rescue Net::HTTPFatalError => e
  #   update(last_error_status: 'Internal Server Error (500)')
  #   return
  # end

  def consume_feed
    feed_fetcher = Sources::FeedFetcher.new.consume(self)
  end

  def reset_articles
    articles.destroy_all
    update(last_modified:nil, etag:nil, last_built: nil)
    consume_feed
  end

  private

  def add_description_and_image
    uri = URI(url)
    response = Faraday.get(uri.origin)
    ogp = OGP::OpenGraph.new(response.body, required_attributes: [])

    image_url = ogp&.image
    description = ogp&.description

  rescue OGP::MalformedSourceError => e
    puts 'source url does not have ogp metadata'
    return
  end

  def update_articles_source_name
    articles.update_all(source_name: name)
  end
end
