#!/bin/bash
set -e

echo "🗄️  Applying Thai vocabulary expansion migration..."
echo "📊 Adding 300+ Thai words/verbs (A1-C2 levels)"

# Get DATABASE_URL from environment
source ~/.bashrc 2>/dev/null || true

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in environment"
    exit 1
fi

# Apply migration using psql
PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p') \
psql "$DATABASE_URL" -f migrations/0005_add_300_thai_words.sql

echo "✅ Migration completed successfully!"
echo "📈 Total vocabulary in database:"

# Count entries by CEFR level
PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p') \
psql "$DATABASE_URL" -c "SELECT cefr_level, COUNT(*) as count FROM entries GROUP BY cefr_level ORDER BY cefr_level;"

echo ""
echo "📝 Total entries:"
PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p') \
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total FROM entries;"

