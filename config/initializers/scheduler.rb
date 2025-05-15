# # frozen_string_literal: true

# require "rufus-scheduler"

# # do not schedule when Rails is run from its console, for a test/spec, or from a Rake task
# return if defined?(Rails::Console) || Rails.env.test? || File.split($PROGRAM_NAME).last == "rake"

# s = Rufus::Scheduler.singleton

# s.every "1h" do
#   Sources::FeedFetcher.new.consume_all
# end
