web: bundle exec puma -C config/puma.rb
release: bundle exec rake db:migrate
jobs: bundle exec rake solid_queue:start