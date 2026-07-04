#!/usr/bin/env bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HRMS — Reset & Re-seed Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️   WARNING: This will drop all tables and re-apply migrations."
read -p "    Are you sure? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

cd backend

echo ""
echo "🗑️   Resetting database..."
npx prisma migrate reset --force --skip-seed

echo ""
echo "🌱  Re-seeding database..."
npx prisma db seed

cd ..

echo ""
echo "✅  Database reset and seeded successfully."
