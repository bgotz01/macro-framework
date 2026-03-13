# M1, M2, and Real M2 YoY Growth Added

## Summary
Successfully added M1 YoY, M2 YoY, and Real M2 YoY growth rates to the database and percentile chart.

## What Was Done

### 1. Created Script: `scripts/add-m1-m2-money-supply.ts`
- Calculates YoY growth from M1SL and M2SL data
- Inserts M1-YoY and M2-YoY series into time_series table
- Calculates Real M2 YoY (M2 YoY - CPI inflation)
- Calculates percentiles for all three series
- Calculates YoY percentile changes

### 2. Updated API: `app/api/percentile-history/route.ts`
- Added M1-YoY, M2-YoY, and Real-M2-YoY to the SQL query
- Returns m1yoy_value, m1yoy_percentile, m1yoy_yoy
- Returns m2yoy_value, m2yoy_percentile, m2yoy_yoy
- Returns realm2yoy_value, realm2yoy_percentile, realm2yoy_yoy

### 3. Updated Chart: `components/charts/percentile-chart.tsx`
- Added M1 YoY Growth to Inflation & Policy category (purple #8b5cf6)
- Added M2 YoY Growth to Inflation & Policy category (light purple #a855f7)
- Added Real M2 YoY (M2-CPI) to Inflation & Policy category (lighter purple #c084fc)

## Data Added
- **M1-YoY**: 792 records (1959-01 to 2025-12)
- **M2-YoY**: 793 records (1959-01 to 2026-01)
- **Real-M2-YoY**: 792 records (1959-01 to 2025-12)

## Latest Values (as of script run)
- **M1 YoY**: 4.20% (37.63th percentile) on 2025-12-01
- **M2 YoY**: 4.29% (21.31th percentile) on 2026-01-01
- **Real M2 YoY**: 1.53% (33.08th percentile) on 2025-12-01
  - Calculation: M2 YoY (4.23%) - CPI (2.70%) = 1.53%

## Interpretation
- **M1/M2 YoY**: Shows nominal money supply growth
- **Real M2 YoY**: Shows inflation-adjusted money supply growth
  - Positive values = money supply growing faster than inflation
  - Negative values = money supply growing slower than inflation (real contraction)

## How to Update
Run the script to recalculate with latest data:
```bash
npx tsx scripts/add-m1-m2-money-supply.ts
```

## Chart Usage
1. Navigate to the percentile chart page
2. Expand "Select Series"
3. Under "Inflation & Policy", check:
   - "M1 YoY Growth" for M1 money supply growth
   - "M2 YoY Growth" for M2 money supply growth
   - "Real M2 YoY (M2-CPI)" for inflation-adjusted M2 growth
4. View actual values, percentile ranks, or YoY percentile changes
