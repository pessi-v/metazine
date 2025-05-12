ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
# require "minitest/reporters"  # Optional for better formatting
# Minitest::Reporters.use!      # Optional for better formatting
require "minitest/autorun"
require "minitest/pride" # Optional, makes test output colorful
require "mocha/minitest" # For mocking/stubbing

# If you want better reporters
begin
  require "minitest/reporters"
  Minitest::Reporters.use! [Minitest::Reporters::DefaultReporter.new(color: true)]
rescue LoadError
  # No reporters
end

class ActiveSupport::TestCase
  # Run tests in parallel with specified workers
  parallelize(workers: :number_of_processors)

  # Set up all fixtures in test/fixtures/*.yml
  fixtures :all

  # Add more helper methods here if needed
end
