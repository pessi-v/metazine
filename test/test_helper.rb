ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require 'webmock/minitest'
require 'mocha/minitest'
# Dir[Rails.root.join('test/support/**/*.rb')].each { |f| require f }
require_relative 'support/feed_test_helpers'


module ActiveSupport
  class TestCase
    include FeedTestHelpers
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
