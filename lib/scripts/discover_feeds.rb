# frozen_string_literal: true
#
# Feed discovery script — recovers Source feed URLs from orphaned articles.
#
# Usage:
#   bin/rails runner lib/scripts/discover_feeds.rb
#
# For each distinct source_name in the articles table, it picks a sample article
# URL, derives the site's base URL, and tries:
#   1. Common feed paths (/feed, /rss, /atom.xml, etc.)
#   2. <link rel="alternate"> autodiscovery on the homepage
#   3. <link rel="alternate"> autodiscovery on the sample article page
#
# Results are printed to stdout and written to tmp/discovered_feeds.csv.
# Sources that already exist in the DB are skipped.
# At the end, you are prompted whether to create Source records for the findings.

require "uri"
require "csv"
require "faraday"
require "faraday/follow_redirects"
require "nokogiri"
require "feedjira"

COMMON_FEED_PATHS = %w[
  /feed
  /feed.xml
  /rss
  /rss.xml
  /atom
  /atom.xml
  /index.xml
  /feeds/all.atom
  /feeds/posts/default
  /blog/feed
  /blog/rss
  /news/feed
  /?feed=rss2
  /?feed=atom
].freeze

REQUEST_TIMEOUT    = 10
OPEN_TIMEOUT       = 5
DELAY_BETWEEN_SITES = 0.5 # seconds, to be polite

# ---------------------------------------------------------------------------

def build_connection(url)
  Faraday.new(url: url) do |f|
    f.use Faraday::FollowRedirects::Middleware, limit: 5
    f.adapter Faraday.default_adapter
    f.options.timeout    = REQUEST_TIMEOUT
    f.options.open_timeout = OPEN_TIMEOUT
    f.headers["User-Agent"] = "Mozilla/5.0 (compatible; MetazineFeedDiscovery/1.0)"
  end
end

def fetch(url)
  uri    = URI.parse(url)
  origin = "#{uri.scheme}://#{uri.host}#{uri.port != uri.default_port ? ":#{uri.port}" : ""}"
  build_connection(origin).get(uri.request_uri)
rescue => e
  nil
end

def valid_feed?(body)
  return false if body.blank?
  feed = Feedjira.parse(body.dup.force_encoding("utf-8"))
  feed.present? && feed.entries.present?
rescue
  false
end

def feed_links_from_html(body, base_url)
  return [] if body.blank?
  doc = Nokogiri::HTML(body)
  doc.css('link[rel="alternate"]').filter_map do |link|
    type = link["type"].to_s.downcase
    next unless type.include?("rss") || type.include?("atom")
    href = link["href"].to_s.strip
    next if href.empty?
    URI.join(base_url, href).to_s
  rescue URI::InvalidURIError
    nil
  end
rescue
  []
end

def origin_for(url)
  uri = URI.parse(url)
  port_part = (!uri.port.nil? && uri.port != uri.default_port) ? ":#{uri.port}" : ""
  "#{uri.scheme}://#{uri.host}#{port_part}"
rescue
  nil
end

def discover_feeds_for(source_name, sample_url)
  base = origin_for(sample_url)
  return [] unless base

  candidates = Set.new

  # 1. Common feed paths
  COMMON_FEED_PATHS.each do |path|
    url      = "#{base}#{path}"
    response = fetch(url)
    candidates << url if response&.success? && valid_feed?(response.body)
  end

  # 2. Autodiscovery from homepage
  homepage = fetch(base)
  if homepage&.success?
    feed_links_from_html(homepage.body, base).each { |u| candidates << u }
  end

  # 3. Autodiscovery from the sample article page
  article_page = fetch(sample_url)
  if article_page&.success?
    feed_links_from_html(article_page.body, base).each { |u| candidates << u }
  end

  # Validate autodiscovered candidates (common paths were already validated above)
  candidates.select do |url|
    next true if COMMON_FEED_PATHS.any? { |p| url.end_with?(p) || url.include?(p + "?") }
    response = fetch(url)
    response&.success? && valid_feed?(response.body)
  end
rescue => e
  puts "  ERROR: #{e.class} — #{e.message}"
  []
end

# ---------------------------------------------------------------------------

existing_urls  = Source.pluck(:url).to_set
existing_names = Source.pluck(:name).to_set

# Group orphaned articles by source_name (those whose source no longer exists)
orphaned_source_names = Article
  .where.not(source_name: [nil, ""])
  .where(source_id: nil)
  .distinct
  .pluck(:source_name)

if orphaned_source_names.empty?
  puts "No orphaned articles found (all articles have a source_id). Nothing to do."
  exit
end

puts "Found #{orphaned_source_names.size} source names with orphaned articles.\n\n"

results = []

orphaned_source_names.each_with_index do |source_name, i|
  sample_url = Article
    .where(source_name: source_name, source_id: nil)
    .where.not(url: [nil, ""])
    .order(published_at: :desc)
    .limit(1)
    .pick(:url)

  unless sample_url
    puts "[#{i + 1}/#{orphaned_source_names.size}] #{source_name} — no usable article URL, skipping"
    next
  end

  print "[#{i + 1}/#{orphaned_source_names.size}] #{source_name} (#{origin_for(sample_url)}) … "
  $stdout.flush

  feeds = discover_feeds_for(source_name, sample_url)

  if feeds.empty?
    puts "no feed found"
    results << { source_name: source_name, sample_url: sample_url, feed_url: nil, status: "not_found" }
  else
    puts "found #{feeds.size}: #{feeds.join(", ")}"
    feeds.each do |feed_url|
      status = existing_urls.include?(feed_url) ? "already_exists" : "new"
      results << { source_name: source_name, sample_url: sample_url, feed_url: feed_url, status: status }
    end
  end

  sleep DELAY_BETWEEN_SITES
end

# ---------------------------------------------------------------------------
# Write CSV

csv_path = Rails.root.join("tmp/discovered_feeds.csv")
CSV.open(csv_path, "w") do |csv|
  csv << %w[source_name feed_url status sample_url]
  results.each { |r| csv << r.values_at(:source_name, :feed_url, :status, :sample_url) }
end

puts "\nResults written to #{csv_path}"

# ---------------------------------------------------------------------------
# Summary

new_feeds = results.select { |r| r[:status] == "new" && r[:feed_url] }
puts "\n#{"=" * 60}"
puts "SUMMARY"
puts "  Sources searched : #{orphaned_source_names.size}"
puts "  New feeds found  : #{new_feeds.size}"
puts "  Not found        : #{results.count { |r| r[:status] == "not_found" }}"
puts "  Already in DB    : #{results.count { |r| r[:status] == "already_exists" }}"
puts "#{"=" * 60}\n\n"

exit if new_feeds.empty?

# ---------------------------------------------------------------------------
# Offer to create Source records

print "Create Source records for the #{new_feeds.size} new feeds? [y/N] "
answer = $stdin.gets.to_s.strip.downcase

unless answer == "y"
  puts "Skipping. You can review #{csv_path} and add sources manually."
  exit
end

new_feeds.each do |r|
  name = r[:source_name]
  name = "#{name} (recovered)" if existing_names.include?(name)

  source = Source.new(name: name, url: r[:feed_url])
  if source.save
    puts "  Created: #{name} — #{r[:feed_url]}"
    existing_names << name
  else
    puts "  Failed (#{source.errors.full_messages.join(", ")}): #{name} — #{r[:feed_url]}"
  end
end

puts "\nDone. Run `bin/rails runner 'Source.consume_all'` (or trigger via the UI) to re-fetch articles."
