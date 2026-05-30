namespace :db do
  task :create_f_unaccent do
    ActiveRecord::Base.establish_connection(ActiveRecord::Base.configurations.find_db_config(Rails.env))
    conn = ActiveRecord::Base.connection
    conn.execute("CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;")
    conn.execute(<<~SQL)
      CREATE OR REPLACE FUNCTION public.f_unaccent(input_text text)
        RETURNS text LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT AS
        $$ BEGIN RETURN public.unaccent(input_text); END $$;
    SQL
  rescue => e
    warn "db:create_f_unaccent skipped: #{e.message}"
  end
end

Rake::Task["db:schema:load"].enhance(["db:create_f_unaccent"])
