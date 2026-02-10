# Percentile Analysis System

## Overview

This system calculates **rolling percentiles** for macro metrics, showing where current values rank compared to all historical data up to that point in time.

## Key Concept

For each date, we calculate what percentile the current value represents compared to **all historical data up to that date** (expanding window approach).

- **0th percentile** = lowest value ever seen (up to that date)
- **50th percentile** = median of all historical values
- **100th percentile** = highest value ever seen (up to that date)

## Database Schema

### `percentile_analysis` Table

```sql
CREATE TABLE percentile_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date INTEGER NOT NULL,              -- Unix timestamp
    asset_class TEXT NOT NULL,          -- e.g., 'economic'
    series_name TEXT NOT NULL,          -- e.g., 'CPI', 'US/FEDFUNDS'
    column_name TEXT NOT NULL,          -- e.g., 'Value'
    value REAL,                         -- The actual value
    percentile_rank REAL,               -- 0-100 percentile rank
    UNIQUE(date, asset_class, series_name, column_name)
);
```

## Scripts

### Calculate Percentiles

```bash
npx tsx scripts/calculate-percentiles.ts
```

This script:
1. Creates the `percentile_analysis` table if it doesn't exist
2. Calculates percentiles for configured series (CPI, Fed Funds)
3. Uses an expanding window approach (each date compared to all prior data)
4. Stores results in the database

**Currently configured series:**
- `economic/CPI` - Consumer Price Index
- `economic/US/FEDFUNDS` - Federal Funds Rate

### Adding New Series

Edit `scripts/calculate-percentiles.ts`:

```typescript
const SERIES_TO_ANALYZE: PercentileConfig[] = [
    {
        assetClass: 'economic',
        seriesName: 'CPI',
        columnName: 'Value'
    },
    {
        assetClass: 'economic',
        seriesName: 'US/FEDFUNDS',
        columnName: 'Value'
    },
    // Add your new series here:
    {
        assetClass: 'bonds',
        seriesName: 'US/TNX',
        columnName: 'Value'
    }
];
```

## API Usage

### PercentileService

Located in `lib/percentile-service.ts`

#### Get Latest Percentile

```typescript
import { PercentileService } from '@/lib/percentile-service';

const latest = PercentileService.getLatestPercentile('economic', 'CPI');
// Returns: { assetClass, seriesName, date, dateStr, value, percentileRank }
```

#### Get Multiple Latest Percentiles

```typescript
const latestPercentiles = PercentileService.getLatestPercentiles([
    { assetClass: 'economic', seriesName: 'CPI' },
    { assetClass: 'economic', seriesName: 'US/FEDFUNDS' }
]);
```

#### Get Historical Percentile Data

```typescript
const history = PercentileService.getPercentileHistory(
    'economic',
    'CPI',
    startDate,  // optional Unix timestamp
    endDate     // optional Unix timestamp
);
```

#### Get Percentile at Specific Date

```typescript
const percentile = PercentileService.getPercentileAtDate(
    'economic',
    'CPI',
    1767139200000  // Unix timestamp
);
```

#### Get Historical Extremes

```typescript
const extremes = PercentileService.getHistoricalExtremes('economic', 'CPI');
// Returns: { highest: {...}, lowest: {...} }
```

## Example Page

Visit `/matrix/percentile` to see the percentile analysis in action.

The page shows:
- Current percentile ranks for CPI and Fed Funds
- Historical highs and lows
- Color-coded percentile ranges
- Interpretation guidance

## Interpretation Guide

### Percentile Ranges

- **0-25th percentile**: Bottom Quartile (LOW)
  - For inflation: Historically low
  - For rates: Historically accommodative
  
- **25-50th percentile**: Below Average
  - Below the historical median
  
- **50-75th percentile**: Above Average
  - Above the historical median
  
- **75-100th percentile**: Top Quartile (HIGH)
  - For inflation: Historically high
  - For rates: Historically restrictive

### Use Cases

1. **Regime Classification**: Determine if current conditions are extreme or normal
2. **Historical Context**: Understand where we are in the cycle
3. **Risk Assessment**: High percentiles may indicate elevated risk
4. **Mean Reversion**: Extreme percentiles often revert to the mean

## Example: CPI Analysis

If CPI is at **44.28th percentile**:
- Current value is **below the historical median**
- 44.28% of all historical observations were at or below this level
- This is in the "below average" range
- Not extreme in either direction

If CPI is at **85th percentile**:
- Current value is **well above the historical median**
- Only 15% of historical observations were higher
- This is in the "high" range (top quartile)
- Historically elevated inflation

## Technical Notes

### Why Expanding Window?

We use an expanding window (all data up to current date) rather than a rolling window because:
1. It provides true historical context
2. Each date's percentile is calculated using only information available at that time
3. Avoids look-ahead bias
4. More intuitive interpretation

### Performance

The calculation uses subqueries to count ranks, which is efficient for SQLite:
- CPI: ~1,870 data points processed in seconds
- Fed Funds: ~859 data points processed in seconds

### Data Quality

- Percentiles are only calculated for non-null values
- Each series maintains its own percentile distribution
- Percentiles are recalculated from scratch each run (no incremental updates)

## Future Enhancements

Potential additions:
- [ ] Add more macro metrics (10Y yields, VIX, etc.)
- [ ] Create percentile-based regime classification
- [ ] Add percentile charts/visualizations
- [ ] Calculate percentile changes (momentum)
- [ ] Add percentile-based alerts
- [ ] Compare percentiles across different metrics
