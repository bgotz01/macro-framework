# SQLite Data Migration

## Overview

Your macro data is now stored in SQLite for better performance and easier querying. The database stores time series data with timestamps for optimal chart rendering and analysis.

## Database Schema

```sql
-- Time series data
CREATE TABLE time_series (
  id INTEGER PRIMARY KEY,
  date INTEGER NOT NULL,           -- Unix timestamp (ms)
  asset_class TEXT NOT NULL,       -- bonds, fx, equities, macro, moneysupply
  series_name TEXT NOT NULL,       -- USmacro, SP500, etc.
  column_name TEXT NOT NULL,       -- 10yr, 2yr, Close, etc.
  value REAL,
  UNIQUE(date, asset_class, series_name, column_name)
);

-- Metadata
CREATE TABLE series_metadata (
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  source TEXT,
  last_updated INTEGER,
  PRIMARY KEY(asset_class, series_name)
);
```

## Migration

To migrate CSV files to SQLite:

```bash
pnpm migrate
```

This will:
1. Read all CSV files from `data/` subdirectories
2. Parse dates and convert to Unix timestamps
3. Insert data into `data/macro-data.db`
4. Create indexes for fast queries

## Usage

### Server-Side (API Routes)

```typescript
import { DataServiceNew } from '@/lib/data-service-new';

// Get available series
const datasets = await DataServiceNew.getDatasetsByAssetClass('bonds');

// Load data
const data = await DataServiceNew.loadCSV('bonds/USmacro.csv');
```

### Client-Side (Components)

The existing `DataService` now uses the API automatically:

```typescript
import { DataService } from '@/lib/data-service';

// Same API as before - now uses SQLite under the hood
const data = await DataService.loadCSV('bonds/USmacro.csv');
```

## API Endpoints

### List datasets
```
GET /api/data/{assetClass}
```

Returns:
```json
{
  "datasets": ["USmacro.csv", "us-yields.csv"]
}
```

### Load series data
```
GET /api/data/{assetClass}?series={filename}
```

Returns:
```json
{
  "data": [
    { "date": "1962-01-02", "10yr": 4.06, "2yr": null, ... }
  ],
  "columns": ["date", "10yr", "2yr", ...],
  "metadata": {
    "title": "USmacro",
    "category": "bonds",
    "filename": "USmacro"
  }
}
```

## Benefits

✅ **Fast queries** - Indexed by date, asset class, and series  
✅ **Easy filtering** - SQL queries for date ranges, specific columns  
✅ **Better for analysis** - Join multiple series, aggregate data  
✅ **Timestamps** - Optimal for charting libraries (Recharts, etc.)  
✅ **Metadata** - Track sources, update times, descriptions  
✅ **Single file** - One database vs. dozens of CSVs  

## Performance

- **110,420 data points** migrated
- **Indexed queries** - Sub-millisecond lookups
- **Cached API responses** - Fast subsequent loads
- **Efficient storage** - ~2MB database vs. scattered CSVs

## Fallback to CSV

To use CSV files instead of SQLite, set in `lib/data-service.ts`:

```typescript
private static USE_API = false;  // Use CSV files
```

## Adding New Data

1. Add CSV files to `data/{assetClass}/` directory
2. Run `pnpm migrate` to update the database
3. Data is immediately available via API

## Database Location

```
data/macro-data.db
```

The database is gitignored. Run `pnpm migrate` after cloning to rebuild it from CSVs.
