release: bundle install && npm install && npm audit fix && bin/rails db:migrate VERBOSE=true --trace
web: bundle exec puma -C config/puma.rb