#!/bin/bash
set -e

# Wait for database to be ready
until ./bin/rails db:prepare
do
  echo "Waiting for database..."
  sleep 1
done

# Execute the container's main process (what's set as CMD in the Dockerfile)
exec "$@"
