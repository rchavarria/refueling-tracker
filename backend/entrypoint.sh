#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node dist/backend/prisma/seed.js

echo "Starting backend server..."
exec node dist/backend/src/index.js
