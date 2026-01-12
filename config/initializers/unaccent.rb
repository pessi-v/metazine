# frozen_string_literal: true

# Setup unaccent function on Rails boot
# This ensures the f_unaccent function exists for database operations

Rails.application.config.after_initialize do
  # Only run in contexts where we have a database connection
  next unless ActiveRecord::Base.connection_pool.connected?

  begin
    # Check if the function exists
    result = ActiveRecord::Base.connection.execute(
      "SELECT 1 FROM pg_proc WHERE proname = 'f_unaccent' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
    )

    # If it doesn't exist, create it
    if result.count == 0
      Rails.logger.info "Creating f_unaccent function..."

      sql = <<~SQL
        CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

        CREATE OR REPLACE FUNCTION public.f_unaccent(input_text text)
        RETURNS text
        LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT AS
        $$
        BEGIN
          RETURN public.unaccent(input_text);
        END
        $$;
      SQL

      ActiveRecord::Base.connection.execute(sql)
      Rails.logger.info "✓ f_unaccent function created"
    end
  rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
    # Database doesn't exist yet or can't connect - this is fine during setup
  rescue => e
    Rails.logger.warn "Could not setup unaccent function: #{e.message}"
  end
end
