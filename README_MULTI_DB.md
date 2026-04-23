# Multi-Database Import System

## Overview

This system allows you to import financial data from CSV files into multiple databases simultaneously:
- **SQLite** (`data/macro-data.db`) - Local development database
- **Postgres (macro-framework)** - Primary production database for macro data
- **Postgres (stockdata)** - Comprehensive database with stock market data

## Quick Start

```bash
# Import to all three databases
npx tsx scripts/import-data-multi-db.ts --all

# Or use the convenience script
bash scripts/import-all-dbs.sh
```

## Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Common commands and quick lookup | Everyone |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What was implemented and how to use it | Developers |
| **[MULTI_DB_MIGRATION.md](MULTI_DB_MIGRATION.md)** | Migration guide from old to new system | DevOps/Admins |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture and data flow | Architects/Developers |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Testing and deployment steps | DevOps/QA |
| **[scripts/README-multi-db-import.md](scripts/README-multi-db-import.md)** | Detailed usage guide | Developers |
| **[data/DATA_UPDATE_GUIDE.md](data/DATA_UPDATE_GUIDE.md)** | Complete data update workflow | Everyone |

## Key Features

✅ **Multi-database support** - Import to 1, 2, or all 3 databases  
✅ **Incremental imports** - Only new data points  
✅ **Automatic deduplication** - Skips existing dates  
✅ **Batch processing** - Efficient bulk inserts  
✅ **Metadata sync** - Keeps series info up to date  
✅ **Error handling** - Continues on errors  
✅ **Progress tracking** - Per-file and per-database stats  

## Common Use Cases

### Daily Data Update
```bash
# 1. Fetch latest data from Yahoo Finance
python scripts/batch_update_all.py

# 2. Import to all databases
npx tsx scripts/import-data-multi-db.ts --all

# 3. Calculate derived metrics
npx tsx scripts/add-cyclical-returns.ts
npx tsx scripts/add-volatility-metrics.ts
```

### Development Workflow
```bash
# Test locally with SQLite
npx tsx scripts/import-data-multi-db.ts --sqlite

# When ready, push to production
npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata
```

### Production Deployment
```bash
# Update all production databases
npx tsx scripts/import-data-multi-db.ts --all
```

## Command-Line Options

| Option | Description |
|--------|-------------|
| `--all` | Import to all three databases |
| `--sqlite` | Include SQLite database |
| `--macro-framework` | Include macro-framework Postgres (default) |
| `--stockdata` | Include stockdata Postgres |

## Environment Setup

Add to your `.env` file:

```bash
# Primary database (used by Prisma by default)
DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"

# Individual database URLs for multi-db imports
MACRO_DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"
STOCKDATA_DATABASE_URL="postgresql://user:password@localhost:5432/stockdata"
SQLITE_DATABASE_PATH="./data/macro-data.db"
```

## File Structure

```
.
├── lib/
│   └── multi-db-client.ts          # Multi-database client utility
├── scripts/
│   ├── import-data-multi-db.ts     # Main import script
│   ├── import-all-dbs.sh           # Convenience wrapper
│   └── README-multi-db-import.md   # Detailed usage guide
├── data/
│   ├── macro-data.db               # SQLite database
│   ├── equities/                   # CSV files
│   ├── bonds/
│   ├── commodities/
│   └── ...
├── .env                            # Database configuration
├── QUICK_REFERENCE.md              # Quick command reference
├── IMPLEMENTATION_SUMMARY.md       # Implementation details
├── MULTI_DB_MIGRATION.md          # Migration guide
├── ARCHITECTURE.md                 # System architecture
└── DEPLOYMENT_CHECKLIST.md        # Deployment steps
```

## Architecture

```
CSV Files → import-data-multi-db.ts → ┬→ SQLite
                                      ├→ macro-framework (Postgres)
                                      └→ stockdata (Postgres)
```

## Database Schemas

### SQLite
- `time_series` - Raw time series data
- `series_metadata` - Series information

### Postgres (both databases)
- `macro_time_series` - Raw time series data
- `macro_series_metadata` - Series information

## Performance

- **Import Speed**: ~2000-5000 rows/second per database
- **Typical Daily Update**: 1-2 minutes for all databases
- **Batch Size**: 1000 rows per insert

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database not found | Check `.env` file configuration |
| Connection refused | Verify Postgres is running: `pg_isready` |
| No new data imported | Run `python scripts/batch_update_all.py` first |
| Permission denied | Check database user has INSERT permissions |

## Getting Help

1. **Quick commands**: See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. **Detailed usage**: See [scripts/README-multi-db-import.md](scripts/README-multi-db-import.md)
3. **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Deployment**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## Backwards Compatibility

The old import scripts still work:
```bash
# SQLite only (legacy)
npx tsx scripts/import-data-incremental.ts

# Postgres only (legacy)
npx tsx scripts/pg/import-data-incremental.ts
```

## Next Steps

1. **Read** [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands
2. **Configure** your `.env` file with database URLs
3. **Test** with `npx tsx scripts/import-data-multi-db.ts --all`
4. **Deploy** using [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## Support

For issues or questions:
- Check the documentation files listed above
- Review script output for error messages
- Verify environment configuration
- Test with a single database first

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-22  
**Maintainer**: Development Team
