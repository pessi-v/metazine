class FixArticlesSearchIndex < ActiveRecord::Migration[8.0]
  def up
    # Drop the old index that doesn't match pg_search's query
    execute "DROP INDEX IF EXISTS index_articles_on_searchable_fields;"

    # Create index that exactly matches what pg_search generates
    # Using 'simple' dictionary to match the query (without unaccent)
    execute <<-SQL
      CREATE INDEX index_articles_on_searchable_fields ON articles
      USING gin(
        (to_tsvector('simple', coalesce(title::text, '')) ||
         to_tsvector('simple', coalesce(source_name::text, '')) ||
         to_tsvector('simple', coalesce(searchable_content, '')))
      );
    SQL
  end

  def down
    execute "DROP INDEX IF EXISTS index_articles_on_searchable_fields;"

    # Recreate the old index
    execute <<-SQL
      CREATE INDEX index_articles_on_searchable_fields ON articles
      USING gin(
        (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
         setweight(to_tsvector('english', coalesce(source_name, '')), 'B') ||
         setweight(to_tsvector('english', coalesce(searchable_content, '')), 'C'))
      );
    SQL
  end
end
