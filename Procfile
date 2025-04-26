release: bundle install && npm install && npm audit fix && bin/rails db:migrate VERBOSE=true
web: bundle exec puma -C config/puma.rb