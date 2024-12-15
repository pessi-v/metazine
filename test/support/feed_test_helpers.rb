# test/support/feed_test_helpers.rb

module FeedTestHelpers
  def stub_feed_request(url, response_body, status: 200, headers: {})
    stub_request(:get, url)
      .to_return(
        status: status,
        body: response_body,
        headers: headers
      )
  end

  def sample_feed_xml
    <<~XML
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <item>
            <title>Test Article</title>
            <link>https://example.com/article</link>
            <description>Test content</description>
            <pubDate>Wed, 15 Dec 2024 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    XML
  end
end