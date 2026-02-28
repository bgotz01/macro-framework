# Real 10Y (10Y-CPI) Calculation

## Summary

**Real 10Y = TNX-Monthly - CPI**

Where:
- **TNX-Monthly** = Monthly average of 10-Year Treasury yields
- **CPI** = Consumer Price Index (inflation rate)

## Detailed Breakdown

### 1. TNX-Monthly Series

The `US/TNX-Monthly` series is created by:
- Taking all daily 10Y Treasury (TNX) values within each month
- Calculating the average of those daily values
- Storing as a single monthly value dated to the 1st of each month

**Why monthly averages?**
- Reduces noise from daily volatility
- Matches CPI reporting frequency (monthly)
- More meaningful for percentile comparisons
- Consistent frequency across all metrics

### 2. CPI Series

The `CPI` series represents the Consumer Price Index inflation rate, reported monthly.

### 3. Real 10Y Calculation

From `scripts/create-real-10y-series.ts`:

```typescript
SELECT 
    tnx.date,
    tnx.value - cpi.value as real_yield
FROM time_series tnx
INNER JOIN time_series cpi 
    ON strftime('%Y-%m', datetime(tnx.date / 1000, 'unixepoch')) = 
       strftime('%Y-%m', datetime(cpi.date / 1000, 'unixepoch'))
WHERE tnx.asset_class = 'bonds'
  AND tnx.series_name = 'US/TNX-Monthly'
  AND cpi.asset_class = 'economic'
  AND cpi.series_name = 'CPI'
```

**Process:**
1. Join TNX-Monthly and CPI by matching year-month
2. Subtract CPI from TNX-Monthly: `real_yield = tnx.value - cpi.value`
3. Store as derived series: `Real-10Y`

## Example

If in January 2024:
- TNX-Monthly (10Y average) = 4.50%
- CPI (inflation) = 3.10%
- Real 10Y = 4.50% - 3.10% = 1.40%

This represents the "real" (inflation-adjusted) yield an investor would receive from 10-year Treasury bonds.

## Database Storage

- **Series Name**: `Real-10Y`
- **Asset Class**: `derived`
- **Display Name**: `Real 10Y (10Y-CPI)`
- **Description**: Real 10-Year Treasury Yield adjusted for CPI inflation
- **Units**: percent
- **Source**: Calculated from US/TNX-Monthly and CPI

## Related Scripts

- `scripts/create-real-10y-series.ts` - Creates the Real-10Y time series
- `scripts/create-derived-percentiles.ts` - Calculates percentiles for Real-10Y
- `scripts/create-real-yield-percentile.ts` - Alternative percentile calculation script
