#!/usr/bin/env bash
set -euo pipefail

# Ensure Prisma schema is applied for SQLite on container start
# Requires DATABASE_URL in env (e.g., file:./prisma/prod.db)

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Applying Prisma schema to database..."
  npx prisma db push || echo "Warning: prisma db push failed; continuing"
else
  echo "DATABASE_URL is not set. Skipping prisma db push."
fi

exec "$@"


