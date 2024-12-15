namespace :sources do
  namespace :feed_fetcher do
    desc "Get new articles from sources"
    task consume_all: :environment do
      Rails.logger = Logger.new(STDOUT)
      Rails.logger.level = :info 
      
      Sources::FeedFetcher.new.consume_all
    end
  end
end
