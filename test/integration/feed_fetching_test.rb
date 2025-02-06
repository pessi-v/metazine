# frozen_string_literal: true

# test/integration/feed_fetching_test.rb

require 'test_helper'

class FeedFetchingTest < ActionDispatch::IntegrationTest
  def setup
    @feed_fetcher = Sources::FeedFetcher.new

    puts 'at least this'
    # Stub the main reddit feed request
    stub_request(:get, 'https://www.reddit.com/r/ruby/.rss')
      .with(
        headers: {
          'Accept' => '*/*',
          'Accept-Encoding' => 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3'
        }
      )
      .to_return(
        status: 200,
        headers: {
          'Accept' => '*/*',
          'Accept-Encoding' => 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
          'last-modified' => 'Tue, 17 Dec 2024 19:11:35 GMT',
          'etag' => '0a72f7d196add60963157aa3512eece4'
        },
        body: "<?xml version='1.0' ?>
        <feed xmlns='http://www.w3.org/2005/Atom'>
          <id>https://www.reddit.com/r/ruby/.rss</id>
          <title type='text'>Ruby Subreddit</title>
          <updated>2024-12-16T13:39:13Z</updated>
          <entry>
            <id>https://www.reddit.com/r/ruby/comments/1hfhnw6/whats_new_in_ruby_34/</id>
            <title type='html'>What’s new in Ruby 3.4 </title>
            <updated>2024-12-16T13:39:13Z</updated>
            <published>2024-12-16T13:39:13Z</published>
            <summary type='html'>This is a correct english language sentence</summary>
            <author>
              <name>Editors</name>
            </author>
            <link href='https://www.reddit.com/r/ruby/comments/1hfhnw6/whats_new_in_ruby_34/' title='What’s new in Ruby 3.4' />
          </entry></feed>"
      )

    # Stub the OGP request to the base URL
    stub_request(:get, 'https://www.reddit.com')
      .with(
        headers: {
          'Accept' => '*/*',
          'Accept-Encoding' => 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3'
        }
      )
      .to_return(
        status: 200,
        body: '
          <html>
            <head>
              <meta property="og:description" content="Reddit Ruby Community">
              <meta property="og:image" content="https://reddit.com/ruby.png">
            </head>
          </html>',
        headers: { 'Content-Type' => 'text/html' }
      )

    stub_request(:get, 'https://www.reddit.com/r/ruby/comments/1hfhnw6/whats_new_in_ruby_34/')
      .with(
        headers: {
          'Accept' => '*/*',
          'Accept-Encoding' => 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
          'User-Agent' => 'Faraday v2.12.2'
        }
      )
      .to_return(
        status: 200,
        body:
        '<!DOCTYPE html>
          <html lang="en-US">
            <head>
              <meta charset="UTF-8"/>

              <title>What’s new in Ruby 3.4</title>
              <meta content="This is a complete english language sentence" name="description"/>

              <!-- Facebook Meta-data -->
              <meta content="https://www.reddit.com/r/ruby/comments/1hfhnw6/whats_new_in_ruby_34/" property="og:url"/>
              <meta content="What’s new in Ruby 3.4" property="og:title"/>
              <meta content="This is a complete english language sentence" property="og:description"/>
              <meta content="https://images.jacobinmag.com/wp-content/uploads/2024/12/17082019/GettyImages-84525813.jpg" property="og:image"/>

            </head>
          <body>
            <p> BOB </p>
          </body>
          </html>',
        headers: {}
      )

    @source = Source.create!(
      name: 'Ruby Reddit',
      url: 'https://www.reddit.com/r/ruby/.rss',
      active: true
    )
  end

  test 'complete feed fetch cycle' do
    assert_difference(['Article.count', '@source.articles.count'], 1) do
      @feed_fetcher.consume(@source)
    end

    # Verify source metadata was updated
    @source.reload
    assert_not_nil @source.last_modified
    assert_not_nil @source.etag
    assert_nil @source.last_error_status

    # Verify article attributes
    article = @source.articles.last
    assert_not_nil article.title
    assert_not_nil article.url
    assert_not_nil article.published_at
    assert article.description.present?
    assert article.summary.present?

    # Verify idempotency - running again shouldn't create duplicates
    assert_no_difference 'Article.count' do
      @feed_fetcher.consume(@source)
    end
  end

  def teardown
    @source.destroy
    Article.where(source: @source).destroy_all
  end
end
