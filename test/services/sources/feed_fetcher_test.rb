# test/services/sources/feed_fetcher_test.rb
require "test_helper"

module Sources
  class FeedFetcherTest < ActiveSupport::TestCase
    setup do
      @feed_fetcher = Sources::FeedFetcher.new
      @source = sources(:one) # Assuming you have fixtures set up
    end

    # Test for consume_all method
    test "consume_all processes all active sources" do
      Source.expects(:active).returns([@source])
      @feed_fetcher.expects(:consume).with(@source).once

      @feed_fetcher.consume_all
    end

    test "consume_all continues processing sources even when one fails" do
      # Create three mock sources
      source1 = sources(:one)
      source2 = sources(:two)
      source3 = sources(:three)

      # Set up Source.active to return our three sources
      Source.expects(:active).returns([source1, source2, source3])

      # The first source will process normally
      @feed_fetcher.expects(:consume).with(source1).once

      # The second source will raise an exception
      @feed_fetcher.expects(:consume).with(source2).raises(StandardError.new("Test error"))

      # The third source should still be processed despite the failure of the second
      @feed_fetcher.expects(:consume).with(source3).once

      # We expect a log message for the error
      Rails.logger.expects(:error).with(regexp_matches(/Error processing source/))

      # Call the method - it should handle the error from source2 and continue
      @feed_fetcher.consume_all
    end

    # Test for successful feed consumption (not modified - 304)
    test "consume handles 304 not modified status" do
      response = mock
      response.stubs(:status).returns(304)

      @feed_fetcher.expects(:make_request).with(source: @source).returns(response)
      @source.expects(:update).with(last_error_status: nil)

      @feed_fetcher.consume(@source)
    end

    # Test for 404 not found
    test "consume handles 404 not found status" do
      response = mock
      response.stubs(:status).returns(404)

      @feed_fetcher.expects(:make_request).with(source: @source).returns(response)
      @feed_fetcher.expects(:handle_fetch_error).with(@source, :not_found)

      @feed_fetcher.consume(@source)
    end

    # Test for 500 internal server error
    test "consume handles 500 internal server error status" do
      response = mock
      response.stubs(:status).returns(500)

      @feed_fetcher.expects(:make_request).with(source: @source).returns(response)
      @feed_fetcher.expects(:handle_fetch_error).with(@source, :internal_server_error)

      @feed_fetcher.consume(@source)
    end

    # Test for successful feed processing
    test "consume processes feed successfully" do
      response = mock
      response.stubs(:status).returns(200)
      response.stubs(:headers).returns({})
      response.stubs(:body).returns("<xml>feed content</xml>")

      feed = mock
      feed.stubs(:entries).returns([mock_entry])
      feed.stubs(:last_modified).returns(Time.now)
      feed.stubs(:respond_to?).with(:last_built).returns(true)
      feed.stubs(:last_built).returns(Time.now)

      @feed_fetcher.expects(:make_request).with(source: @source).returns(response)
      @feed_fetcher.expects(:decode_response).with(response).returns(response)
      @feed_fetcher.expects(:parse_feed).with(response, source: @source).returns(feed)
      @feed_fetcher.expects(:feed_not_modified?).with(response, feed, @source).returns(false)
      @feed_fetcher.expects(:process_feed).with(feed, @source, response)

      @feed_fetcher.consume(@source)
    end

    # Test for feed not modified (based on feed attributes)
    test "consume handles feed not modified based on feed attributes" do
      response = mock
      response.stubs(:status).returns(200)
      response.stubs(:headers).returns({})
      response.stubs(:body).returns("<xml>feed content</xml>")

      feed = mock
      feed.stubs(:entries).returns([mock_entry])
      feed.stubs(:last_modified).returns(Time.now)
      feed.stubs(:respond_to?).with(:last_built).returns(true)
      feed.stubs(:last_built).returns(Time.now)

      @feed_fetcher.expects(:make_request).with(source: @source).returns(response)
      @feed_fetcher.expects(:decode_response).with(response).returns(response)
      @feed_fetcher.expects(:parse_feed).with(response, source: @source).returns(feed)
      @feed_fetcher.expects(:feed_not_modified?).with(response, feed, @source).returns(true)
      @source.expects(:update).with(last_error_status: nil)

      @feed_fetcher.consume(@source)
    end

    # Test for make_request method with valid URL
    test "make_request with valid URL creates proper connection" do
      url = "https://example.com/feed.xml"
      connection = mock
      response = mock
      response.stubs(:status).returns(200)

      connection.expects(:get).returns(response)

      @feed_fetcher.expects(:valid_url?).with(url).returns(true)
      @feed_fetcher.expects(:connection).with(source: nil, url: url).returns(connection)

      result = @feed_fetcher.send(:make_request, url: url)
      assert_equal response, result
    end

    # Test for make_request with various errors
    test "make_request handles connection failures" do
      @feed_fetcher.expects(:valid_url?).returns(true)
      @feed_fetcher.expects(:connection).raises(Faraday::ConnectionFailed.new("Failed to connect"))
      @feed_fetcher.expects(:handle_fetch_error).with(@source, :connection_failed, kind_of(Faraday::ConnectionFailed))

      @feed_fetcher.send(:make_request, source: @source)
    end

    # Test for parse_feed method
    test "parse_feed handles successful parsing" do
      response = mock
      response.stubs(:body).returns("<xml>feed content</xml>")

      feed = mock
      feed.stubs(:nil?).returns(false)
      feed.stubs(:entries).returns([mock_entry])

      Feedjira.expects(:parse).returns(feed)

      result = @feed_fetcher.send(:parse_feed, response, source: @source)
      assert_equal feed, result
    end

    test "parse_feed handles empty feed" do
      response = mock
      response.stubs(:body).returns("<xml>feed content</xml>")

      feed = mock
      feed.stubs(:nil?).returns(false)
      feed.stubs(:entries).returns([])

      Feedjira.expects(:parse).returns(feed)
      @feed_fetcher.expects(:handle_fetch_error).with(@source, :empty_feed)

      result = @feed_fetcher.send(:parse_feed, response, source: @source)
      assert_nil result
    end

    test "parse_feed handles no parser available" do
      response = mock
      response.stubs(:body).returns("<html>not a feed</html>")

      Feedjira.expects(:parse).raises(Feedjira::NoParserAvailable.new("No parser available"))
      @feed_fetcher.expects(:handle_fetch_error).with(@source, :xml_parse_error, kind_of(Feedjira::NoParserAvailable))

      result = @feed_fetcher.send(:parse_feed, response, source: @source)
      assert_equal false, result
    end

    # Test for process_feed method
    test "process_feed updates source metadata" do
      entry = mock_entry

      feed = mock
      feed.stubs(:entries).returns([entry])
      feed.stubs(:last_modified).returns(Time.now)
      feed.stubs(:respond_to?).with(:last_built).returns(true)
      feed.stubs(:last_built).returns(Time.now)

      response = mock
      response.stubs(:headers).returns({"etag" => "some-etag"})

      @feed_fetcher.expects(:process_entries).with([entry], @source)
      @feed_fetcher.expects(:update_source_metadata).with(@source, feed, response)

      result = @feed_fetcher.send(:process_feed, feed, @source, response)
      assert result
    end

    # Helper method for creating a mock entry
    def mock_entry
      entry = mock
      entry.stubs(:url).returns("https://example.com/article")
      entry
    end
  end
end
