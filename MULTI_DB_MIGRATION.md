# Multi-Database Import Migration Guide

## Overview

The application has been enhanced to support importing data to multiple databases simultaneously:
1. **SQLite** (`data/macro-data.db`) - Legacy local database
2. **Postgres (macro-framework)** - Primary production database
3. **Postgres (stockdata)** - Comprehensive stock data database

---

## 🚀 Run Order — Copy & Paste

### Weekly (new market data available)

```bash
# 1. Download latest prices from Yahoo Finance → CSV files
python3 scripts/batch_update_all.py

# 2. Import CSVs into all local DBs
npx tsx scripts/import-data-multi-db.ts --all

# 3. Calculate all derived metrics (returns, volatility, yields, PE, percentiles, MAs)
bash scripts/calculate-macro-db.sh

# 4. Push to Neon (production)
python3 scripts/push-to-neon.py
```

### Monthly (after entering CPI / M2 / EPS via /data-input)

```bash
# 1. Calculate all derived metrics
bash scripts/calculate-macro-db.sh

# 2. Push to Neon (production)
python3 scripts/push-to-neon.py
```

### What `calculate-macro-db.sh` runs (in order)

| # | Script | What it calculates |
|---|--------|--------------------|
| 1 | `scripts/pg/add-cyclical-returns.ts` | 2Y / 5Y / 10Y returns |
| 2 | `scripts/pg/add-volatility-metrics.ts` | 63 / 126 / 252 / 504-day rolling volatility |
| 3 | `scripts/pg/calculate-monthly-bond-yields.ts` | Month-end bond yield series |
| 4 | `scripts/pg/calculate-derived-series.ts` | Real Yields, Yield Curves, EYP, REY |
| 4b | `scripts/pg/calculate-pe5yr.ts` | PE-2yr, PE-5yr, Earnings Yield |
| 5 | `scripts/pg/calculate-percentiles.ts` | Percentile ranks for all key series |
| 6 | `scripts/pg/calculate-yoy-percentile-change.ts` | YoY percentile changes |
| 7 | `scripts/pg/calculate-sp500-moving-averages.ts` | 50 / 200 / 500-day MAs |
| 8 | `scripts/pg/calculate-sp500-ma-divergence.ts` | Price divergence from MAs |
| 8 | `scripts/pg/calculate-sp500-ma-slope.ts` | Daily MA slope % |
| 8 | `scripts/pg/calculate-sp500-ma-stats.ts` | Slope streaks, price-above-MA streaks |
| 9 | `scripts/pg/calculate-ma-percentiles.ts` | Percentile ranks for MA series |

---

## What Changed

### New Files Created

1. **`lib/multi-db-client.ts`**
   - Multi-database client utility
   - Manages connections to SQLite and multiple Postgres databases
   - Provides helper functions for database detection and disconnection

2. **`scripts/import-data-multi-db.ts`**
   - Main multi-database import script
   - Supports importing to 1, 2, or all 3 databases
   - Command-line flags for database selection
   - Incremental imports (only new data)
   - Per-database statistics

3. **`scripts/import-all-dbs.sh`**
   - Convenience wrapper script
   - Imports to all three databases with one command

4. **`scripts/README-multi-db-import.md`**
   - Comprehensive documentation for multi-database imports
   - Usage examples, troubleshooting, architecture

5. **`MULTI_DB_MIGRATION.md`** (this file)
   - Migration guide and summary

### Modified Files

1. **`.env`**
   - Added `MACRO_DATABASE_URL` for explicit macro-framework connection
   - Added `STOCKDATA_DATABASE_URL` for stockdata connection
   - Added `SQLITE_DATABASE_PATH` for SQLite file location
   - Kept `DATABASE_URL` as primary connection (used by Prisma)

2. **`data/DATA_UPDATE_GUIDE.md`**
   - Updated overview to mention multiple databases
   - Added multi-database import instructions
   - Added environment configuration section
   - Updated database schema section to cover all three databases
   - Updated quick start guide with new import commands

## How to Use

### Basic Usage

```bash
# Import to all three databases
npx tsx scripts/import-data-multi-db.ts --all

# Or use the convenience script
bash scripts/import-all-dbs.sh
```

### Selective Import

```bash
# Import to macro-framework only (default)
npx tsx scripts/import-data-multi-db.ts

# Import to macro-framework and stockdata
npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata

# Import to SQLite and macro-framework
npx tsx scripts/import-data-multi-db.ts --sqlite --macro-framework
```

### Complete Workflow

There are two data tracks that must both be done before pushing to Neon:

#### Track A — Market Data (weekly, automated)
Prices, yields, FX, commodities, etc. fetched from Yahoo Finance.

```bash
# 1. Download latest prices from Yahoo Finance → CSV files
python3 scripts/batch_update_all.py

# 2. Import CSVs into all local DBs
npx tsx scripts/import-data-multi-db.ts --all

# 3. Calculate all derived metrics against macro-framework
bash scripts/calculate-macro-db.sh

# 4. Push macro-framework → Neon (production)
python3 scripts/push-to-neon.py
```

Or run steps 2–4 in one command:
```bash
bash scripts/update-neon.sh
```

#### Track B — Manual Data (monthly, via UI)
CPI-U, M2, and SP500 EPS are entered manually via the `/data-input` page in the app.
The UI writes directly to the local `macro-framework` DB and auto-calculates YoY / TTM inline.

After entering manual data, recalculate all derived metrics and push to Neon:

```bash
# Recalculate all derived metrics against macro-framework
bash scripts/calculate-macro-db.sh

# Push macro-framework → Neon
python3 scripts/push-to-neon.py
```

> **Note:** Manual data entered via `/data-input` only writes to `macro-framework`.
> It does not go through `import-data-multi-db.ts`, so `stockdata` will not have
> CPI/M2/EPS updates. The app reads from `macro-framework` (via Neon in production),
> so this is fine for production use.

#### Full Combined Run (when both tracks have new data)

```bash
python3 scripts/batch_update_all.py   # fetch market data
bash scripts/update-neon.sh           # import + calculate all metrics + push to Neon
```

Manual data entered via `/data-input` is already in `macro-framework` — `update-neon.sh`
will pick it up when it runs `calculate-macro-db.sh` and `push-to-neon.py`.

### Batch Scripts Reference

| Script | Description |
|--------|-------------|
| `scripts/calculate-all-metrics.sh` | Core metrics runner — accepts a Postgres DB URL as argument |
| `scripts/calculate-macro-db.sh` | Runs all metrics against local `macro-framework` (Postgres) |
| `scripts/calculate-stockdata-db.sh` | Runs all metrics against local `stockdata` (Postgres) |
| `scripts/calculate-sqlite-db.sh` | Runs all metrics against local SQLite (`data/macro-data.db`) |
| `scripts/calculate-neon-db.sh` | Runs all metrics directly against Neon (production) |
| `scripts/update-neon.sh` | Full pipeline: import all → calculate all → push to Neon |
| `scripts/push-to-neon.py` | Incremental push of local `macro-framework` → Neon |

### What `calculate-all-metrics.sh` runs (in order)

1. `scripts/pg/add-cyclical-returns.ts` — 2Y/5Y/10Y returns
2. `scripts/pg/add-volatility-metrics.ts` — 63/126/252/504-day volatility
3. `scripts/pg/calculate-monthly-bond-yields.ts` — month-end bond yield series
4. `scripts/pg/calculate-derived-series.ts` — Real Yields, Yield Curves, EYP, REY
5. `scripts/pg/calculate-percentiles.ts` — percentile ranks for all key series
6. `scripts/pg/calculate-yoy-percentile-change.ts` — YoY percentile changes
7. `scripts/pg/calculate-sp500-moving-averages.ts` — 50/200/500-day MAs
8. `scripts/pg/calculate-sp500-ma-divergence.ts` — price divergence from MAs
9. `scripts/pg/calculate-sp500-ma-slope.ts` — daily MA slope %
10. `scripts/pg/calculate-sp500-ma-stats.ts` — slope streaks, price-above streaks
11. `scripts/pg/calculate-ma-percentiles.ts` — percentile ranks for MA series

## Environment Setup

Update your `.env` file with database connection strings:

```bash
# Primary database (used by Prisma by default)
DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"

# Individual database URLs for multi-db imports
MACRO_DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"
STOCKDATA_DATABASE_URL="postgresql://user:password@localhost:5432/stockdata"
SQLITE_DATABASE_PATH="./data/macro-data.db"
```

## Migration Path

### For Existing Users

If you're currently using the old import scripts:

**Before:**
```bash
npx tsx scripts/import-data-incremental.ts  # SQLite only
# or
npx tsx scripts/pg/import-data-incremental.ts  # Postgres only
```

**After:**
```bash
npx tsx scripts/import-data-multi-db.ts --all  # All databases
```

### Backwards Compatibility

The old import scripts still work:
- `scripts/import-data-incremental.ts` - SQLite only
- `scripts/pg/import-data-incremental.ts` - Postgres (macro-framework) only

You can continue using them if you only need to update one database.

## Benefits

1. **Single Command** - Import to multiple databases with one script
2. **Consistency** - Ensures all databases have the same data
3. **Flexibility** - Choose which databases to update
4. **Efficiency** - Faster than running separate imports
5. **Redundancy** - Data backed up across multiple databases
6. **Development** - Use SQLite locally, Postgres in production

## Database Comparison

| Feature | SQLite | macro-framework | stockdata |
|---------|--------|-----------------|-----------|
| **Type** | Local file | Postgres | Postgres |
| **Size** | Small (~100MB) | Medium (~500MB) | Large (~5GB+) |
| **Purpose** | Development/Legacy | Production macro data | Comprehensive stock data |
| **Tables** | time_series, series_metadata | macro_time_series, macro_series_metadata | All tables + macro tables |
| **Use Case** | Local testing | Primary production | Full stock analytics |

## Architecture

```
┌─────────────────────────────────────────┐
│     CSV Files (data/)                   │
│  - equities/                            │
│  - bonds/                               │
│  - commodities/                         │
│  - crypto/                              │
│  - fx/                                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  import-data-multi-db.ts                │
│  - Parses CSV files                     │
│  - Validates data                       │
│  - Checks for duplicates                │
│  - Batch inserts                        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┬───────────────┐
       ↓               ↓               ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   SQLite    │ │    macro-   │ │  stockdata  │
│             │ │  framework  │ │             │
│ time_series │ │ macro_time_ │ │ macro_time_ │
│ series_     │ │   series    │ │   series    │
│  metadata   │ │ macro_      │ │ macro_      │
│             │ │  series_    │ │  series_    │
│             │ │  metadata   │ │  metadata   │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Performance

- **Import Speed**: ~2000-5000 rows/second per database
- **Typical Daily Update**: 1-2 minutes for all databases
- **Batch Size**: 1000 rows per insert (Postgres)
- **Concurrent**: Databases are updated sequentially (not parallel)

## Troubleshooting

### Issue: Database not found
**Solution**: Check `.env` file has correct connection strings

### Issue: Connection refused
**Solution**: Verify Postgres is running with `pg_isready`

### Issue: No new data imported
**Solution**: Run `python scripts/batch_update_all.py` first to fetch new data

### Issue: Permission denied
**Solution**: Check database user has INSERT permissions

## Next Steps

1. **Update your `.env`** file with all database URLs
2. **Test the import** with `npx tsx scripts/import-data-multi-db.ts --all`
3. **Update your workflows** to use the new script
4. **Monitor performance** and adjust batch sizes if needed

## Support

For issues or questions:
- Check `scripts/README-multi-db-import.md` for detailed documentation
- Review `data/DATA_UPDATE_GUIDE.md` for complete workflow
- Check script output for specific error messages

## Future Enhancements

Planned improvements:
- Parallel database imports for better performance
- Selective series import (by asset class)
- Dry-run mode to preview changes
- Data validation and quality checks
- Rollback capability
