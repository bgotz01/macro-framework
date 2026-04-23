# Multi-Database Import Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Data Sources                                 │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │ Yahoo Finance│              │     FRED     │                  │
│  └──────┬───────┘              └──────┬───────┘                 │
└─────────┼──────────────────────────────┼──────────────────────────┘
          │                              │
          ↓                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Python Update Scripts                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  batch_update_all.py                                     │   │
│  │  - update_equities.py                                    │   │
│  │  - update_bonds.py                                       │   │
│  │  - update_commodities.py                                 │   │
│  │  - update_crypto.py                                      │   │
│  │  - update_fx.py                                          │   │
│  │  - update_volatility.py                                  │   │
│  │  - update_stocks.py                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CSV Files (data/)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │equities/ │  │  bonds/  │  │commodities│  │  crypto/ │       │
│  │  US/     │  │   US/    │  │          │  │          │       │
│  │  GSPC.csv│  │  TNX.csv │  │  GC=F.csv│  │BTCUSD.csv│       │
│  │  DJI.csv │  │  FVX.csv │  │  CL=F.csv│  │ETHUSD.csv│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐                                    │
│  │   fx/    │  │volatility│                                    │
│  │EURUSD.csv│  │ VIX.csv  │                                    │
│  └──────────┘  └──────────┘                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│           Multi-Database Import Script                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  import-data-multi-db.ts                                 │   │
│  │                                                          │   │
│  │  1. Parse CSV files (papaparse)                         │   │
│  │  2. Validate data (Date, Value columns)                 │   │
│  │  3. Check existing data in each DB                      │   │
│  │  4. Filter new rows (incremental)                       │   │
│  │  5. Batch insert (1000 rows at a time)                  │   │
│  │  6. Update metadata                                     │   │
│  │  7. Report statistics                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Uses: lib/multi-db-client.ts                                   │
└─────────────┬────────────────┬────────────────┬─────────────────┘
              │                │                │
              ↓                ↓                ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    SQLite       │  │ macro-framework │  │   stockdata     │
│                 │  │   (Postgres)    │  │   (Postgres)    │
│ data/macro-     │  │                 │  │                 │
│  data.db        │  │ localhost:5432  │  │ localhost:5432  │
│                 │  │                 │  │                 │
│ Tables:         │  │ Tables:         │  │ Tables:         │
│ - time_series   │  │ - macro_time_   │  │ - macro_time_   │
│ - series_       │  │   series        │  │   series        │
│   metadata      │  │ - macro_series_ │  │ - macro_series_ │
│                 │  │   metadata      │  │   metadata      │
│                 │  │                 │  │ + 50+ other     │
│ Size: ~100MB    │  │ Size: ~500MB    │  │   tables        │
│                 │  │                 │  │ Size: ~5GB+     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Component Details

### 1. Data Sources
- **Yahoo Finance**: Stock prices, indices, commodities, crypto, FX
- **FRED**: Economic indicators, interest rates

### 2. Python Update Scripts
- Fetch latest data from APIs
- Update CSV files incrementally
- Handle rate limiting and errors
- Located in `scripts/`

### 3. CSV Storage
- Organized by asset class
- Subdirectories for geography (e.g., `equities/US/`)
- Standard format: `Date,Value`
- Located in `data/`

### 4. Multi-Database Import
- Single TypeScript script
- Supports multiple databases
- Command-line flags for selection
- Incremental imports only

### 5. Database Clients

#### SQLite Client (better-sqlite3)
```typescript
const db = new Database(sqlitePath);
db.prepare('INSERT OR IGNORE INTO time_series ...');
```

#### Postgres Clients (Prisma)
```typescript
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});
await prisma.macro_time_series.createMany({
  data: rows,
  skipDuplicates: true
});
```

## Data Flow

```
CSV File → Parse → Validate → Check Existing → Filter New → Insert → Update Metadata
   ↓         ↓        ↓            ↓              ↓           ↓           ↓
GSPC.csv  Papa    Date/Value   MAX(date)    date > max   Batch 1000   last_updated
          parse   columns      query        filter       rows         timestamp
```

## Database Selection Logic

```typescript
// Command line: --all --sqlite --macro-framework --stockdata
const useSqlite = args.includes('--sqlite') || args.includes('--all');
const useMacroFramework = args.includes('--macro-framework') || args.includes('--all') || args.length === 0;
const useStockData = args.includes('--stockdata') || args.includes('--all');

// Create clients based on flags
const clients = createMultiDbClient({
  useSqlite,
  useMacroFramework,
  useStockData
});
```

## Import Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initialize                                                │
│    - Parse command line arguments                           │
│    - Load environment variables                             │
│    - Create database clients                                │
│    - Load metadata file                                     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. For each asset class (equities, bonds, etc.)            │
│    - Get list of CSV files                                  │
│    - Scan subdirectories recursively                        │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. For each CSV file                                        │
│    - Read and parse CSV                                     │
│    - Validate columns (Date, Value)                         │
│    - Parse dates to ISO format                              │
│    - Filter out invalid/zero values                         │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. For each database (if enabled)                           │
│    - Query MAX(date) for this series                        │
│    - Filter rows where date > MAX(date)                     │
│    - Skip if no new rows                                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Insert data                                              │
│    - Batch insert (1000 rows at a time)                     │
│    - Use skipDuplicates (Postgres)                          │
│    - Use INSERT OR IGNORE (SQLite)                          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Update metadata                                          │
│    - Upsert series_metadata record                          │
│    - Update last_updated timestamp                          │
│    - Set display_name, description, etc.                    │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Report statistics                                        │
│    - Count rows per database                                │
│    - Count files processed/skipped/errors                   │
│    - Display summary                                        │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│ Error Type              │ Handling                          │
├─────────────────────────┼───────────────────────────────────┤
│ Database connection     │ Log error, skip that database     │
│ CSV parse error         │ Log error, skip that file         │
│ Invalid date format     │ Skip that row, continue           │
│ Missing columns         │ Log error, skip that file         │
│ Duplicate key           │ Automatically skipped (idempotent)│
│ Network timeout         │ Retry with exponential backoff    │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

| Operation | SQLite | Postgres |
|-----------|--------|----------|
| Connection | Instant | ~100ms |
| Single insert | ~1ms | ~5ms |
| Batch insert (1000) | ~100ms | ~200ms |
| Query MAX(date) | ~1ms | ~5ms |
| Metadata upsert | ~1ms | ~10ms |

**Typical import (100 files, 500 new rows each):**
- SQLite: ~30 seconds
- Postgres (macro-framework): ~45 seconds
- Postgres (stockdata): ~45 seconds
- **Total (all three)**: ~2 minutes

## Concurrency Model

Currently **sequential** (one database at a time):
```
SQLite → macro-framework → stockdata
```

Future enhancement: **parallel** imports:
```
     ┌→ SQLite
CSV ─┼→ macro-framework
     └→ stockdata
```

## Configuration Management

```
.env file
    ↓
process.env
    ↓
createMultiDbClient()
    ↓
┌─────────────────────────────────────┐
│ SQLite: SQLITE_DATABASE_PATH        │
│ Macro:  MACRO_DATABASE_URL          │
│ Stock:  STOCKDATA_DATABASE_URL      │
└─────────────────────────────────────┘
```

## Schema Mapping

| SQLite | Postgres | Purpose |
|--------|----------|---------|
| `time_series` | `macro_time_series` | Raw data points |
| `series_metadata` | `macro_series_metadata` | Series info |
| `date` (TEXT) | `date` (TEXT) | ISO date string |
| `value` (REAL) | `value` (FLOAT) | Numeric value |

## Metadata Structure

```json
{
  "equities": {
    "US/GSPC": {
      "displayName": "S&P 500",
      "description": "US stock market index",
      "geography": "United States",
      "units": "points"
    }
  }
}
```

## Future Architecture Enhancements

1. **Parallel Imports**: Use Promise.all() to import to all databases simultaneously
2. **Streaming**: Process large CSV files in chunks
3. **Validation**: Add data quality checks before import
4. **Rollback**: Transaction support for atomic imports
5. **Monitoring**: Add metrics and logging
6. **Caching**: Cache MAX(date) queries for better performance


RUN REGIME ENGINE
npx tsx scripts/build-regime-timeline.ts
