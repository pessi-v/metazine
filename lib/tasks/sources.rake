namespace :sources do
  namespace :feed_fetcher do
    desc "Get new articles from sources"
    task consume_all: :environment do
      Sources::FeedFetcher.new.consume_all
    end
  end
end
