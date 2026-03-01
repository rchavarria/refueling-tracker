#!/bin/sh
set -e

echo ""
echo "#1 => Running database migrations..."
npx prisma migrate deploy

echo ""
echo "#2 => Generating prisma client... (needed to seed db and run the backend)"
npm run prisma:generate

echo ""
echo "#3 => Seeding database..."
npm run db:seed

echo ""
echo "#4 => Starting backend server..."
npm run dev
