# frozen_string_literal: true

source 'https://rubygems.org'

ruby '3.3.6'

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem 'rails', '~> 8.0.1'

# The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
# gem "sprockets-rails"

# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem 'propshaft'

# Use postgresql as the database for Active Record
gem 'pg', '~> 1.1'

# Use the Puma web server [https://github.com/puma/puma]
gem 'puma', '>= 5.0'

# Use JavaScript with ESM import maps [https://github.com/rails/importmap-rails]
gem 'importmap-rails'

# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem 'turbo-rails'

# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem 'stimulus-rails'

# Use Dart SASS [https://github.com/rails/dartsass-rails]
gem 'dartsass-rails'

# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem 'jbuilder'

# Use Redis adapter to run Action Cable in production
gem 'redis', '>= 4.0.1'

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[windows jruby]

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', require: false

gem 'slim-rails' # Slim HTML templating engine

# Simple, but flexible HTTP client library, with support for multiple backends.
gem 'faraday', '~> 2.0'
gem 'faraday-follow_redirects'

gem 'feedjira'

# a ruby library to fetch and parse meta tags which represent OpenGraph Protocol and TwitterCard.
# gem 'ogpr', git: 'https://github.com/pessi-v/ogpr', branch: 'master'
gem 'ogp'

# Addressable is an alternative implementation to the URI implementation that is part of Ruby's standard library.
# It is flexible, offers heuristic parsing, and additionally provides extensive support for IRIs and URI templates.
gem 'addressable'

gem 'nokogiri'

# Run backend JS code with Node
gem 'node-runner', '~> 1.2'

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

gem 'dotenv'

gem 'rufus-scheduler'

# Compact language detection
gem 'cld'

# Postgres full-text search
gem 'pg_search'

# ActivityPub
# gem 'activitypub', git: 'https://github.com/rauversion/activitypub' # last update autumn 23
# gem 'activitypub', git: 'https://github.com/vidarh/activitypub' # last update autumn 24
# gem 'federails', git: 'https://gitlab.com/experimentslabs/federails', branch: 'main'
# gem 'federails', git: 'https://github.com/pessi-v/federails', branch: 'main'

# gem "federails", path: "/Users/pes/code/federails"
gem "federails", git: "https://gitlab.com/pessi-v/federails", branch: "federails-cursor"
# gem 'pundit'
# gem 'kaminari'
# gem 'devise'

gem 'dockerfile-rails', '>= 1.6', group: :development
gem 'pagy', '~> 9.1' # pagination

gem 'brotli' # decode compressed http responses
gem 'faraday-gzip', '~> 3' # request compressed http responses
gem 'lograge' # hide partial rendering logs
gem 'ruby-readability', require: 'readability' # Similar to Mozilla's Readability JS package
gem 'zstd-ruby' # decode compressed http responses

# gem 'mini_magick'
gem 'dhash-vips'

# Fast transformer inference for Ruby 
gem "informers"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem 'debug', platforms: %i[mri windows]
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem 'web-console'

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"

  gem 'fastimage' # required for readability
  gem 'webfinger' # Webfinger CLIENT
  gem "standard"
end

group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem 'capybara'
  gem 'factory_bot', '~> 6.5'
  gem 'mocha'    # For mocking/stubbing in general
  gem 'selenium-webdriver'
  gem 'webmock'  # For mocking HTTP requests
end
