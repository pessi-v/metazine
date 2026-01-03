class AddSearchableContentToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :searchable_content, :text

    # Add GIN index for full-text search on title, source_name, and searchable_content
    # Using gin_trgm_ops for better performance with prefix searches
    execute <<-SQL
      CREATE INDEX index_articles_on_searchable_fields ON articles
      USING gin(
        (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
         setweight(to_tsvector('english', coalesce(source_name, '')), 'B') ||
         setweight(to_tsvector('english', coalesce(searchable_content, '')), 'C'))
      );
    SQL

    # Add index on published_at for sorting performance
    add_index :articles, :published_at
  end
end
