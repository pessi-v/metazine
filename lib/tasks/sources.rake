# frozen_string_literal: true

namespace :sources do
  namespace :feed_fetcher do
    desc 'Get new articles from sources'
    task consume_all: :environment do
      Rails.logger = Logger.new($stdout)
      Rails.logger.level = :info

      Sources::FeedFetcher.new.consume_all
    end
  end

  desc 'Update image URLs for sources with missing or broken images'
  task update_images: :environment do
    Rails.logger = Logger.new($stdout)
    Rails.logger.level = :info

    total_sources = Source.count
    updated_count = 0
    failed_count = 0

    puts "Processing #{total_sources} sources..."

    Source.find_each.with_index(1) do |source, index|
      print "\r[#{index}/#{total_sources}] Processing #{source.name}..."

      # Skip if source already has an image_url
      if source.image_url.present?
        # Optionally, we could validate if the URL is still valid
        # For now, we'll skip sources that already have an image
        next
      end

      # Call the private method to fetch OGP data
      source.send(:add_description_and_image)

      if source.changed?
        if source.save
          updated_count += 1
          puts "\r[#{index}/#{total_sources}] ✓ Updated #{source.name}"
        else
          failed_count += 1
          puts "\r[#{index}/#{total_sources}] ✗ Failed to save #{source.name}: #{source.errors.full_messages.join(', ')}"
        end
      end
    end

    puts "\n"
    puts "=" * 50
    puts "Summary:"
    puts "  Total sources: #{total_sources}"
    puts "  Updated: #{updated_count}"
    puts "  Failed: #{failed_count}"
    puts "  Skipped (already had image): #{total_sources - updated_count - failed_count}"
    puts "=" * 50
  end

  desc 'Force update image URLs for all sources (including those with existing images)'
  task force_update_images: :environment do
    Rails.logger = Logger.new($stdout)
    Rails.logger.level = :info

    total_sources = Source.count
    updated_count = 0
    failed_count = 0

    puts "Force updating all #{total_sources} sources..."

    Source.find_each.with_index(1) do |source, index|
      print "\r[#{index}/#{total_sources}] Processing #{source.name}..."

      # Call the private method to fetch OGP data
      source.send(:add_description_and_image)

      if source.changed?
        if source.save
          updated_count += 1
          puts "\r[#{index}/#{total_sources}] ✓ Updated #{source.name}"
        else
          failed_count += 1
          puts "\r[#{index}/#{total_sources}] ✗ Failed to save #{source.name}: #{source.errors.full_messages.join(', ')}"
        end
      end
    end

    puts "\n"
    puts "=" * 50
    puts "Summary:"
    puts "  Total sources: #{total_sources}"
    puts "  Updated: #{updated_count}"
    puts "  Failed: #{failed_count}"
    puts "  No changes: #{total_sources - updated_count - failed_count}"
    puts "=" * 50
  end
end
