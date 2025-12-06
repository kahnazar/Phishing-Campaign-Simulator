#!/bin/sh
set -e

echo "=========================================="
echo "PhishLab Docker Entrypoint"
echo "=========================================="

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-phishlab}"
DB_PASSWORD="${DB_PASSWORD:-phishlab_password}"
DB_NAME="${DB_NAME:-phishlab}"

until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping..."
  sleep 2
done

echo "✓ PostgreSQL is ready!"

# Run database initialization
echo "Running database initialization..."
if [ -f "backend/dist/scripts/init-db.js" ]; then
  node backend/dist/scripts/init-db.js
  if [ $? -eq 0 ]; then
    echo "✓ Database initialization completed"
  else
    echo "✗ Database initialization failed"
    exit 1
  fi
else
  echo "Warning: init-db.js not found, skipping initialization"
  echo "You may need to run migrations manually"
fi

echo "=========================================="
echo "Starting PhishLab application..."
echo "=========================================="

# Execute command (already running as node user from Dockerfile)
exec "$@"
