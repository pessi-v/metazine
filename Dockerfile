# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t federails_cursor .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name federails_cursor federails_cursor

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.4.4
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages (including Node.js for node-runner)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/rails/vendor/bundle" \
    BUNDLE_WITHOUT="development"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config zlib1g-dev libpq-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives
    
# Update to Node.js 22 (if using a Debian/Ubuntu-based image)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# If needed, you can also update npm
RUN npm install -g npm@10.8.2

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local path "${BUNDLE_PATH}"
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Copy application code
COPY . .

# Create a directory for node_modules and install npm packages locally
RUN mkdir -p /rails/node_modules
RUN npm install --prefix /rails jsdom @mozilla/readability

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

# Final stage for app image
FROM base

# Install Node.js in the final stage too (needed for node-runner)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@10.8.2 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems, application
COPY --from=build /rails/vendor/bundle /rails/vendor/bundle
COPY --from=build /rails /rails

# Copy node_modules from the build stage
COPY --from=build /rails/node_modules /rails/node_modules

RUN chmod +x bin/docker-entrypoint bin/thrust

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
chown -R rails:rails db log storage tmp vendor node_modules

# Set NODE_PATH so node can find the modules
ENV NODE_PATH=/rails/node_modules

USER 1000:1000

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]