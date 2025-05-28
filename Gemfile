source "https://rubygems.org"

ruby "3.4.4"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.0.2"
# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem "propshaft"
# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"

# Postgres full-text search
gem 'pg_search'

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"
# Use JavaScript with ESM import maps [https://github.com/rails/importmap-rails]
gem "importmap-rails"
# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem "turbo-rails"
# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "stimulus-rails"
# Use Dart SASS [https://github.com/rails/dartsass-rails]
gem "dartsass-rails"
# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ windows jruby ]

# Use the database-backed adapters for Rails.cache, Active Job, and Action Cable
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Deploy this application anywhere as a Docker container [https://kamal-deploy.org]
gem "kamal", require: false

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

# Slim HTML templating engine
gem 'slim-rails'

# Simple, but flexible HTTP client library, with support for multiple backends.
gem 'faraday', '~> 2.0'
gem 'faraday-follow_redirects'

# RSS and Atom feed parsing
gem 'feedjira'

# a ruby library to fetch and parse meta tags which represent OpenGraph Protocol and TwitterCard.
gem 'ogp'
gem 'ostruct'
# Addressable is an alternative implementation to the URI implementation that is part of Ruby's standard library.
# It is flexible, offers heuristic parsing, and additionally provides extensive support for IRIs and URI templates.
gem 'addressable'

# HTML document parsing
gem 'nokogiri'

# Run backend JS code
gem 'node-runner', '~> 1.2'

# Use .env files
gem 'dotenv'

# gem 'rufus-scheduler'

# ActivityPub
gem "federails", git: "https://gitlab.com/pessi-v/federails", branch: "federails-cursor"
# gem "federails", path: "../federails"

# Authentication with omniauth
gem "omniauth"
gem "omniauth-rails_csrf_protection"
gem 'omniauth-mastodon', git: 'https://github.com/trakt/omniauth-mastodon' # this fork works with omniauth gem version 2
gem 'mastodon-api', require: 'mastodon', git: 'https://github.com/daverooneyca/mastodon-api' # this fork works with at least ruby 3.3.4

 # pagination
gem 'pagy', '~> 9.1'

 # decode compressed http responses
gem 'brotli'

 # request compressed http responses
gem 'faraday-gzip', '~> 3'

 # hide partial rendering logs
# gem 'lograge'

 # Similar to Mozilla's Readability JS package, used as a fallback
gem 'ruby-readability', require: 'readability'

# decode compressed http responses
gem 'zstd-ruby'

# Compact language detection
gem 'cld'

# Image manipulation
# gem 'mini_magick'

# Compare image similarity
gem 'dhash-vips'

# Database metrics
gem 'pghero'
gem "pg_query", ">= 2"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false

  gem 'minitest'
  gem 'minitest-reporters', '~> 1.6' 
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  gem 'fastimage'
  gem 'webfinger'
  gem 'standard'

  gem 'mocha'
end
