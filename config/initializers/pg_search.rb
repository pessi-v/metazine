# frozen_string_literal: true

# Configure pg_search to use our IMMUTABLE f_unaccent function
# This allows accent-insensitive search with GIN indexes
PgSearch.unaccent_function = "f_unaccent"
