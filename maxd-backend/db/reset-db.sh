#!/bin/bash

set -e

# Load environment variables from .env if available

# Load .env from project root (one level up from /db)
ENV_PATH="$(dirname "$0")/../.env"

if [ -f "$ENV_PATH" ]; then
  export $(grep -v '^#' "$ENV_PATH" | xargs)
  echo "Loaded DATABASE_URL: $DATABASE_URL"
else
  echo "Missing .env file at $ENV_PATH"
  exit 1
fi

# Make sure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Please set your DATABASE_URL environment variable."
  exit 1
fi

# Make sure schema.sql exists
if [ ! -f schema.sql ]; then
  echo "Missing schema file at db/schema.sql"
  exit 1
fi

echo "Resetting database..."

# Run the schema file
psql "$DATABASE_URL" -f schema.sql
