# PE-5yr Metric Implementation

## Overview
Created a new P/E ratio metric using 5-year rolling earnings (PE-5yr) as an alternative to Shiller P/E (CAPE), which uses 10-year rolling earnings and has lagging data.

## Data Sources
- **S&P 500 Price**: `valuations/SP500-Price` (1,179 records)
- **5-Year Rolling EPS**: `valuations/SP500-EPS-5yr` (1,120 records)

## Calculation
```
PE-5yr = SP500-Price / SP500-EPS-5yr
```

## Implementation Files

### 1. Data Creation Script
**File**: `scripts/create-pe5yr.ts`
- Reads S&P 500 Price and SP500-EPS-5yr from database
- Calculates PE-5yr for matching dates
- Stores in `time_series` table under `valuations/PE-5yr`
- Created 1,120 PE-5yr records

### 2. Percentile Calculation
**File**: `scripts/calculate-percentiles.ts`
- Added PE-5yr to `SERIES_TO_ANALYZE` array
- Calculates expanding window percentiles (each date compared to all prior data)
- Stores in `percentile_analysis` table

### 3. API Endpoints Updated
**Files**:
- `app/api/percentile-year/route.ts` - Added PE-5yr to year-end data fetch
- `app/api/percentile-history/route.ts` - Added PE-5yr to historical chart data

### 4. UI Components Updated
**Files**:
- `components/percentile-viewer.tsx` - Added PE-5yr to metrics table
- `components/charts/percentile-chart.tsx` - Added PE-5yr to chart series options
- `app/matrix/percentile/page.tsx` - Added PE-5yr to initial data fetch

## Current Data (Feb 2026)
- **Value**: 35.38x
- **Percentile**: 97.05th (Top 3% historically)
- **Interpretation**: Extremely elevated valuation

## Key Insights
- PE-5yr shows similar extreme valuation levels as Shiller P/E
- Both metrics currently in 97-98th percentile range
- PE-5yr has more recent data (Feb 2026 vs Sep 2025 for Shiller)
- Uses 5-year rolling average vs 10-year for Shiller

## Usage
Run scripts in order:
```bash
# 1. Create PE-5yr data
npx tsx scripts/create-pe5yr.ts

# 2. Calculate percentiles
npx tsx scripts/calculate-percentiles.ts
```

## Database Schema
```sql
-- time_series table
INSERT INTO time_series (asset_class, series_name, column_name, date, value)
VALUES ('valuations', 'PE-5yr', 'Value', <timestamp>, <pe_value>)

-- percentile_analysis table
INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
VALUES (<timestamp>, 'valuations', 'PE-5yr', 'Value', <pe_value>, <percentile>)
```

## Benefits Over Shiller P/E
1. **More Current Data**: PE-5yr has data through Feb 2026 vs Sep 2025 for Shiller
2. **Shorter Smoothing Window**: 5-year vs 10-year rolling average
3. **More Responsive**: Captures recent earnings changes faster
4. **Same Methodology**: Still uses rolling average to smooth cyclical variations
