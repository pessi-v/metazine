release: bundle install && npm install && npm audit fix && bin/rake db:migrate --trace VERBOSE=true
web: bundle exec puma -C config/puma.rb