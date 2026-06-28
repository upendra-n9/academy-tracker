#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

# Only seed if coaches table is empty
COACH_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.coach.count().then(n => { console.log(n); prisma.\$disconnect(); }).catch(() => { console.log(0); });
")

if [ "$COACH_COUNT" = "0" ]; then
  echo "🌱 Seeding database (first run)..."
  node dist/utils/seed.js
else
  echo "✅ Database already seeded ($COACH_COUNT coaches found), skipping seed."
fi

echo "🚀 Starting server..."
exec node dist/index.js
