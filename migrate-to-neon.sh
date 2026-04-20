#!/bin/bash

# Migration script to push local PostgreSQL database to Neon
# Usage: ./migrate-to-neon.sh

set -e  # Exit on error

echo "🔄 Starting database migration to Neon..."

# Local database credentials
LOCAL_DB="postgresql://borisgotzev:koinare@localhost:5432/macro-framework"

# Neon database credentials
NEON_DB="postgresql://neondb_owner:npg_ctIk17SlNPME@ep-wild-breeze-amav0gsv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Create backup directory if it doesn't exist
mkdir -p backups

# Generate timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/macro-framework-${TIMESTAMP}.sql"

echo "📦 Creating backup of local database..."
pg_dump "$LOCAL_DB" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

echo ""
echo "⚠️  WARNING: This will DROP existing tables in Neon and restore from local backup"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "🚀 Restoring to Neon database..."
psql "$NEON_DB" < "$BACKUP_FILE"

echo ""
echo "✅ Migration complete!"
echo "🔍 Verifying tables in Neon..."

# Verify tables exist
psql "$NEON_DB" -c "\dt"

echo ""
echo "✨ Done! Your database has been migrated to Neon."
echo "📝 Don't forget to:"
echo "   1. Update VERCEL environment variables with new DATABASE_URL"
echo "   2. Redeploy your application"
