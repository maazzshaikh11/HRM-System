#!/usr/bin/env bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HRMS — First-Time Developer Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Check prerequisites ───────────────────────────────────────
check_cmd() {
  command -v "$1" &>/dev/null || { echo "❌  $1 is required but not installed."; exit 1; }
}

check_cmd node
check_cmd npm
echo "✅  Node $(node --version) found."

# ─── Backend setup ─────────────────────────────────────────────
echo ""
echo "📦  Installing backend dependencies..."
cd backend && npm install && cd ..

# ─── Frontend setup ────────────────────────────────────────────
echo ""
echo "📦  Installing frontend dependencies..."
cd frontend && npm install && cd ..

# ─── Environment variables ─────────────────────────────────────
echo ""
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📝  Created backend/.env from example. Fill in your credentials."
else
  echo "ℹ️   backend/.env already exists. Skipping."
fi

# ─── Generate Prisma client ───────────────────────────────────
echo ""
echo "🔧  Generating Prisma client..."
cd backend && npx prisma generate && cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Fill in backend/.env with your Supabase credentials."
echo "  2. Run migrations:   npm run db:migrate"
echo "  3. Seed the DB:      npm run db:seed"
echo "  4. Start dev server: npm run dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
