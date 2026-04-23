# Multi-Database Import - Quick Reference

## TL;DR

```bash
# Import to all databases
npx tsx scripts/import-data-multi-db.ts --all
```

## Common Commands

```bash
# All databases (SQLite + macro-framework + stockdata)
npx tsx scripts/import-data-multi-db.ts --all
bash scripts/import-all-dbs.sh  # Same as above

# Macro-framework only (default)
npx tsx scripts/import-data-multi-db.ts
npx tsx scripts/import-data-multi-db.ts --macro-framework

# Macro-framework + StockData
npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata

# SQLite + Macro-framework
npx tsx scripts/import-data-multi-db.ts --sqlite --macro-framework

# SQLite only
npx tsx scripts/import-data-multi-db.ts --sqlite
```

## Daily Workflow

```bash
# 1. Fetch latest data from Yahoo Finance
python scripts/batch_update_all.py

# 2. Import to all databases
npx tsx scripts/import-data-multi-db.ts --all

# 3. Calculate derived metrics (optional)
npx tsx scripts/add-cyclical-returns.ts
npx tsx scripts/add-volatility-metrics.ts
```

## Environment Setup

Add to `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"
MACRO_DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"
STOCKDATA_DATABASE_URL="postgresql://user:password@localhost:5432/stockdata"
SQLITE_DATABASE_PATH="./data/macro-data.db"
```

## Flags

| Flag | Database |
|------|----------|
| `--all` | All three databases |
| `--sqlite` | SQLite (data/macro-data.db) |
| `--macro-framework` | Postgres (macro-framework) |
| `--stockdata` | Postgres (stockdata) |

## Files

| File | Purpose |
|------|---------|
| `scripts/import-data-multi-db.ts` | Main import script |
| `scripts/import-all-dbs.sh` | Convenience wrapper |
| `lib/multi-db-client.ts` | Database client utility |

## Documentation

| File | Content |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | What was implemented |
| `MULTI_DB_MIGRATION.md` | Migration guide |
| `scripts/README-multi-db-import.md` | Detailed usage guide |
| `data/DATA_UPDATE_GUIDE.md` | Complete workflow |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database not found | Check `.env` file |
| Connection refused | Verify Postgres is running: `pg_isready` |
| No new data | Run `python scripts/batch_update_all.py` first |

## Legacy Scripts (Still Work)

```bash
# SQLite only
npx tsx scripts/import-data-incremental.ts

# Postgres (macro-framework) only
npx tsx scripts/pg/import-data-incremental.ts
```
