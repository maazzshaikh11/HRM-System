#!/usr/bin/env bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HRMS — Database Seed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f backend/.env ]; then
  echo "❌  backend/.env not found. Run scripts/setup.sh first."
  exit 1
fi

cd backend
echo "🌱  Running Prisma seed..."
npx prisma db seed
cd ..

echo ""
echo "✅  Database seeded successfully."
