# Quick Start - SQLite Data Setup

## What Changed

Your macro data is now stored in **SQLite** instead of loading CSV files directly. This gives you:

- ⚡ **Faster queries** - Indexed database lookups
- 📊 **Better for charts** - Timestamps optimized for Recharts
- 🔍 **Easy analysis** - SQL queries for filtering/aggregating
- 📦 **Single file** - One database vs. scattered CSVs

## Setup (First Time)

```bash
# Install dependencies
pnpm install

# Migrate CSV data to SQLite
pnpm migrate
```

This creates `data/macro-data.db` with 110K+ data points.

## Your Components Still Work

No changes needed! The `DataService` API is the same:

```typescript
// This now uses SQLite under the hood
const data = await DataService.loadCSV('bonds/USmacro.csv');
```

## Query the Database

```bash
# List available series
pnpm exec tsx scripts/query-db.ts list bonds

# Load data
pnpm exec tsx scripts/query-db.ts load bonds USmacro

# Check date range
pnpm exec tsx scripts/query-db.ts range equities DJI
```

## API Endpoints

```bash
# List datasets
curl http://localhost:3000/api/data/bonds

# Load series
curl "http://localhost:3000/api/data/bonds?series=USmacro.csv"
```

## Database Stats

```
Asset Class    | Series | Data Points
---------------|--------|------------
bonds          | 2      | 58,516
equities       | 3      | 36,225
fx             | 2      | 420
macro          | 2      | 945
moneysupply    | 4      | 14,314
---------------|--------|------------
TOTAL          | 13     | 110,420
```

## Adding New Data

1. Add CSV to `data/{assetClass}/filename.csv`
2. Run `pnpm migrate`
3. Data is immediately available

## Troubleshooting

**Database not found?**
```bash
pnpm migrate
```

**Want to use CSV files instead?**

In `lib/data-service.ts`:
```typescript
private static USE_API = false;
```

**Need to rebuild database?**
```bash
rm data/macro-data.db
pnpm migrate
```

## Next Steps

Consider adding:
- Date range filtering in API
- Aggregation endpoints (monthly/yearly averages)
- Metadata endpoints (descriptions, sources)
- Export to CSV functionality
- Data validation on migration
