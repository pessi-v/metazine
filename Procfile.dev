web: bundle exec puma -C config/puma.rb
release: bundle install && npm install && npm audit fix && bin/rails db:prepare
jobs: bundle exec rake solid_queue:start