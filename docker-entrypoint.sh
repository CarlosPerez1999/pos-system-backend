#!/bin/sh
set -e

# Wait for the database to be ready (optional) - adjust host/port via env vars
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database $DB_HOST:$DB_PORT..."
  # simple wait loop
  until nc -z "$DB_HOST" "$DB_PORT"; do
    echo "Waiting for Postgres..."
    sleep 1
  done
fi

# Run migrations
echo "Running migrations..."
pnpm run migration:run || echo "Migration command failed or no pending migrations"

# Start the app
echo "Starting app..."
node dist/main
