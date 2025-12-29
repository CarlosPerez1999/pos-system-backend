#!/bin/sh
set -e

# Defaults
: "${DB_HOST:=localhost}"
: "${DB_PORT:=5432}"
: "${POSTGRES_USER:=postgres}"
: "${POSTGRES_PASSWORD:=postgres}"
: "${POSTGRES_DB:=postgres}"

PGDATA=/var/lib/postgresql/data

init_db_if_needed() {
  # Ensure runtime directories exist
  mkdir -p /run/postgresql
  chown -R postgres:postgres /run/postgresql

  if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing Postgres database at $PGDATA"
    mkdir -p "$PGDATA"
    chown -R postgres:postgres "$PGDATA"
    su-exec postgres initdb -D "$PGDATA"
    # Set password for postgres user
    cat <<-EOSQL > /tmp/init.sql
    ALTER USER "$POSTGRES_USER" WITH PASSWORD '$POSTGRES_PASSWORD';
    CREATE DATABASE "$POSTGRES_DB";
EOSQL
    su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='localhost'" -w start
    su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres --file /tmp/init.sql || true
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
    rm -f /tmp/init.sql
  else
    echo "Postgres already initialized"
  fi
}

start_postgres() {
  echo "Starting Postgres..."
  chown -R postgres:postgres "$PGDATA"
  su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='*' -p $DB_PORT" -w start
}

wait_for_postgres() {
  echo "Waiting for Postgres on $DB_PORT..."
  until nc -z 127.0.0.1 "$DB_PORT"; do
    sleep 1
  done
}

# Initialize DB if needed
init_db_if_needed

# Start Postgres in background
start_postgres

# Wait for postgres to accept connections
wait_for_postgres

echo "Running migrations..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm run migration:run || echo "No migrations or migration command failed"
else
  echo "pnpm not found; skipping migrations"
fi

echo "Starting Node app"
exec node dist/main
