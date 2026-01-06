# Archived Migrations

These migrations were archived on 2026-01-06 as part of a migration consolidation effort.

## What happened?

All 22 migrations that existed before 2026-01-06 have been moved to this archive directory. The application now uses `db/schema.rb` as the single source of truth for the database schema.

## Why archive migrations?

1. **Migration conflicts**: The original migrations had dependency issues (federails migrations from May 2025 referenced tables created in October 2025)
2. **Test database issues**: The `f_unaccent` function creation was causing test failures
3. **Simpler fresh installs**: New environments can use `rails db:schema:load` instead of running 22 migrations
4. **Production safety**: Production database is already fully migrated (version: 2026_01_03_124356)

## How to set up a new database

For fresh installs (development, test, or new environments):

```bash
# Development
rails db:setup

# Test
RAILS_ENV=test rails db:setup
```

This will:
1. Create the database
2. Load the schema from `db/schema.rb`
3. Seed the database

## Production

Production is unaffected by this change. The production database already has all tables, indexes, and functions created. No migrations need to be run.

## Future migrations

Going forward, when you create new migrations:

```bash
rails generate migration AddColumnToTable column:type
```

These will work normally. The migration system will continue to function as expected.

## Archived Migration List

These migrations were archived (in chronological order):

### May 2025 - Early federails & monitoring
- `20250514164154_add_actor_type_to_federails_actor.rb`
- `20250514170945_add_extensions_to_federails_actor.rb`
- `20250515120939_create_pghero_query_stats.rb`
- `20250515120949_create_pghero_space_stats.rb`
- `20250515121208_remove_federails_followings_index.rb`

### October 2025 - Users & auth
- `20251025164838_enable_pg_stat_statements.rb`
- `20251025232702_create_users.rb`
- `20251025233217_add_omniauth_fields_to_users.rb`
- `20251025233239_add_user_id_to_comments.rb`

### October 28, 2025 - Federails bundle
- `20251028135316_create_federails_actors.federails.rb`
- `20251028135317_create_federails_followings.federails.rb`
- `20251028135318_create_federails_activities.federails.rb`
- `20251028135319_add_uuids.federails.rb`
- `20251028135320_add_keypair_to_actors.federails.rb`
- `20251028135321_add_extensions_to_federails_actors.federails.rb`
- `20251028135322_add_local_to_actors.federails.rb`
- `20251028135323_add_actor_type_to_actors.federails.rb`
- `20251028135324_add_tombstoned_at_to_actors.federails.rb`
- `20251028135325_create_federails_hosts.federails.rb`

### January 2026 - Search improvements
- `20260103115623_add_searchable_content_to_articles.rb`
- `20260103120707_fix_articles_search_index.rb`
- `20260103124356_make_unaccent_immutable.rb`

## Need to reference a migration?

These files are kept in version control for reference. If you need to see what a particular migration did, you can find it in this directory.

## DO NOT

- Do not run these migrations
- Do not move them back to `db/migrate/`
- Do not delete them (they're part of the project history)
