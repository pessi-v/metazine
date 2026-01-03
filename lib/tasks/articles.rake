# frozen_string_literal: true

namespace :articles do
  desc "Backfill searchable_content for all existing articles"
  task backfill_searchable_content: :environment do
    puts "Starting backfill of searchable_content for articles..."

    total = Article.count
    processed = 0
    updated = 0
    skipped = 0

    Article.find_each(batch_size: 100) do |article|
      processed += 1

      if article.readability_output_jsonb.blank? || article.readability_output_jsonb["content"].blank?
        skipped += 1
        next
      end

      html_content = article.readability_output_jsonb["content"]

      # Parse HTML and extract text
      doc = Nokogiri::HTML(html_content)
      doc.css('script, style').remove

      text = doc.text
        .gsub(/\s+/, ' ')
        .strip

      # Truncate to 10000 chars
      searchable_content = text[0...10000]

      # Update without callbacks to avoid triggering after_create_commit
      article.update_column(:searchable_content, searchable_content)
      updated += 1

      # Progress indicator
      if (processed % 100).zero?
        puts "Processed #{processed}/#{total} articles (#{updated} updated, #{skipped} skipped)"
      end
    end

    puts "\nBackfill complete!"
    puts "Total processed: #{processed}"
    puts "Updated: #{updated}"
    puts "Skipped: #{skipped}"
  end
end
