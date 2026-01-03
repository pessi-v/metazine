class MakeUnaccentImmutable < ActiveRecord::Migration[8.0]
  def up
    # Ensure the unaccent extension is installed
    # Use raw SQL to ensure it's created before we reference it
    execute "CREATE EXTENSION IF NOT EXISTS unaccent;"

    # Create an IMMUTABLE wrapper around unaccent
    # This allows it to be used in GIN indexes
    # WARNING: This assumes the unaccent dictionary won't change
    # If you modify unaccent.rules, you'll need to REINDEX
    # Using plpgsql instead of sql to avoid inlining issues during creation

    execute <<-SQL
      CREATE OR REPLACE FUNCTION public.f_unaccent(text)
      RETURNS text
      LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT AS
      $$
      BEGIN
        RETURN unaccent($1);
      END
      $$;
    SQL

    # Drop the existing index
    execute "DROP INDEX IF EXISTS index_articles_on_searchable_fields;"

    # Recreate index with our immutable unaccent function
    execute <<-SQL
      CREATE INDEX index_articles_on_searchable_fields ON articles
      USING gin(
        (to_tsvector('simple', f_unaccent(coalesce(title::text, ''))) ||
         to_tsvector('simple', f_unaccent(coalesce(source_name::text, ''))) ||
         to_tsvector('simple', f_unaccent(coalesce(searchable_content, ''))))
      );
    SQL
  end

  def down
    # Drop our custom function
    execute "DROP FUNCTION IF EXISTS public.f_unaccent(text);"

    # Recreate the index without unaccent
    execute "DROP INDEX IF EXISTS index_articles_on_searchable_fields;"

    execute <<-SQL
      CREATE INDEX index_articles_on_searchable_fields ON articles
      USING gin(
        (to_tsvector('simple', coalesce(title::text, '')) ||
         to_tsvector('simple', coalesce(source_name::text, '')) ||
         to_tsvector('simple', coalesce(searchable_content, '')))
      );
    SQL
  end
end
