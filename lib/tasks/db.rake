namespace :db do
  desc "Copy readability_output string content to readability_output_jsonb JSONB column"
  task migrate_readability_output_to_jsonb: :environment do
    Article.where.not(readability_output: [nil, '']).find_each do |article|
      begin
        # Convert Ruby hash string to actual hash, then to JSON
        hash = eval(article.readability_output)
        article.update_column(:readability_output_jsonb, hash)
      rescue => e
        puts "Error processing article #{article.id}: #{e.message}"
      end
    end
  end

end
