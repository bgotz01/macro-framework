# Earnings Yield 5yr Series

## Overview
Created an Earnings Yield series based on the 5-year rolling P/E ratio (PE-5yr) as a complement to the existing Earnings Yield based on Shiller CAPE (10-year).

## Calculation
```
Earnings Yield 5yr = (1 / PE-5yr) × 100
```

Where PE-5yr is the Price-to-Earnings ratio using 5-year rolling average earnings.

## Data Location
- Asset Class: `valuations`
- Series Name: `Earnings-Yield-5yr`
- Display Name: `Earnings Yield (5yr)`
- Units: `percent`

## Implementation

### Script
**File**: `scripts/add-earnings-yield-5yr.ts`

Run to generate the series:
```bash
npx tsx scripts/add-earnings-yield-5yr.ts
```

The script:
1. Reads all PE-5yr data from the database
2. Calculates Earnings Yield as 1/PE × 100
3. Stores in `time_series` table under `valuations/Earnings-Yield-5yr`
4. Adds metadata to `series_metadata` table

### Metadata
Added to `data/series-metadata.json`:
```json
{
  "Earnings-Yield-5yr": {
    "displayName": "Earnings Yield (5yr)",
    "description": "Earnings Yield based on 5-year rolling P/E (1/PE ratio) - Inverse of 5-year rolling P/E ratio",
    "geography": "US",
    "units": "percent"
  }
}
```

### UI Integration
Updated `components/charts/yield-chart.tsx`:
- Added valuations asset class to data loading
- Added "Equity Valuation" category to dropdown options
- Now displays both Earnings Yield (CAPE 10yr) and Earnings Yield (5yr)

## Comparison with CAPE-based Earnings Yield

| Metric | Earnings Yield (CAPE 10yr) | Earnings Yield (5yr) |
|--------|---------------------------|---------------------|
| Based on | Shiller CAPE (10-year rolling) | PE-5yr (5-year rolling) |
| Asset Class | economic | valuations |
| Smoothing Window | 10 years | 5 years |
| Responsiveness | Less responsive to recent changes | More responsive to recent changes |
| Data Currency | Through Sep 2025 | Through Feb 2026 |

## Use Cases
- Compare earnings yields across different time horizons
- Calculate spreads between earnings yield and bond yields
- Analyze equity risk premium using different P/E methodologies
- More current data for recent market analysis

## Next Steps
If needed, can also add:
- Percentile calculations for Earnings-Yield-5yr
- Derived metrics (e.g., Earnings Yield Premium using 5yr)
- Rolling averages for the series
