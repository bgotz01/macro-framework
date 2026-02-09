# Rolling Average Scripts

Scripts to calculate and add rolling 1-year averages to time series data in the SQLite database.

## Overview

The rolling average calculation creates a new column in the database for each series. For example:
- Monthly data: `CPI.Value` → `CPI.Value_MA12` (12-month moving average)
- Daily data: `US/GSPC.Value` → `US/GSPC.Value_MA252` (252-day moving average)

The rolling averages are stored as separate column_name entries in the same `time_series` table, making them easy to query alongside the original data.

## Scripts

### 1. `list-series.ts`
Lists all available time series in the database with metadata.

```bash
npx tsx scripts/list-series.ts
```

Shows:
- Asset class and series name
- Number of data points
- Estimated frequency (daily, monthly, etc.)
- Date range
- Duration in years

### 2. `add-rolling-averages.ts`
Calculates and adds rolling 1-year averages to **monthly** series.

```bash
npx tsx scripts/add-rolling-averages.ts
```

- Window: 12 periods (months)
- Currently configured for: CPI, CPINominal

### 3. `add-rolling-averages-daily.ts`
Calculates and adds rolling 1-year averages to **daily** series.

```bash
npx tsx scripts/add-rolling-averages-daily.ts
```

- Window: 252 periods (trading days)
- Processes all daily series across:
  - Bonds (US treasuries, Fed Funds)
  - Commodities (Oil, Gold, Silver)
  - Crypto (BTC, ETH)
  - Equities (Major indices worldwide)
  - FX (EUR, GBP, JPY)
  - Volatility (VIX)

## Configuration

### Monthly Data Script

Edit `add-rolling-averages.ts` and add series to the `seriesConfigs` array:

```typescript
const seriesConfigs: SeriesConfig[] = [
  {
    asset_class: 'economic',
    series_name: 'CPI',
    column_name: 'Value',
    frequency: 'monthly',
    window: 12
  },
];
```

### Daily Data Script

Edit `add-rolling-averages-daily.ts` and add series to the `seriesConfigs` array:

```typescript
const seriesConfigs: SeriesConfig[] = [
  { asset_class: 'equities', series_name: 'US/GSPC', column_name: 'Value' },
  { asset_class: 'bonds', series_name: 'US/TNX', column_name: 'Value' },
];
```

### Window Sizes

Choose the appropriate window size based on data frequency:
- **Daily data**: 252 (trading days in a year)
- **Monthly data**: 12 (months in a year)
- **Weekly data**: 52 (weeks in a year)
- **Quarterly data**: 4 (quarters in a year)

## How It Works

1. Fetches all data points for a series
2. Sorts by date ascending
3. Calculates rolling average using a sliding window
4. Only creates averages where there are enough data points (≥ window size)
5. Inserts results with a new column_name (e.g., `Value_MA12` or `Value_MA252`)

## Chart Display

The chart component at `/app/matrix/chart` automatically detects and displays:
- **Blue solid line**: Original value
- **Purple dashed line**: MA12 (monthly 12-period average) if available
- **Orange dashed line**: MA252 (daily 252-period average) if available

## Example Queries

### Query with MA12 (Monthly)
```sql
SELECT 
  datetime(date/1000, 'unixepoch') as date,
  value as original,
  (SELECT value FROM time_series t2 
   WHERE t2.date = t1.date 
   AND t2.series_name = 'CPI' 
   AND t2.column_name = 'Value_MA12') as ma12
FROM time_series t1
WHERE series_name = 'CPI' 
  AND column_name = 'Value'
ORDER BY date DESC
LIMIT 10;
```

### Query with MA252 (Daily)
```sql
SELECT 
  datetime(date/1000, 'unixepoch') as date,
  ROUND(value, 2) as SPX,
  ROUND((SELECT value FROM time_series t2 
   WHERE t2.date = t1.date 
   AND t2.series_name = 'US/GSPC' 
   AND t2.column_name = 'Value_MA252'), 2) as ma252
FROM time_series t1
WHERE series_name = 'US/GSPC' 
  AND column_name = 'Value'
ORDER BY date DESC
LIMIT 10;
```

## Notes

- The scripts use `INSERT OR REPLACE`, so you can safely re-run them to update values
- Rolling averages require at least `window` data points, so early dates won't have averages
- The scripts skip series that don't have enough data points
- Keep monthly and daily scripts separate for clarity and maintainability
