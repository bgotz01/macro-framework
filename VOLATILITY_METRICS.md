# Volatility Metrics Feature

## Overview

Added historical volatility metrics for all equity indexes in the database. Volatility is calculated as annualized standard deviation of daily returns over three rolling windows.

## What was added

### 1. Volatility Calculation Script
**File:** `scripts/add-volatility-metrics.ts`

Calculates three rolling volatility metrics for all equity series:
- **63-day** (3 months): Short-term volatility
- **126-day** (6 months): Medium-term volatility  
- **252-day** (1 year): Long-term volatility

**Methodology:**
- Calculates daily returns from price data
- Computes rolling standard deviation over each window
- Annualizes using `stddev * sqrt(252)`
- Stores as percentage values

**Usage:**
```bash
npx tsx scripts/add-volatility-metrics.ts
```

### 2. Volatility Chart Component
**File:** `components/charts/volatility-chart.tsx`

New standalone chart component featuring:
- Series selector (all equity indexes)
- Date range controls
- Period toggle (3mo / 6mo / 1yr)
- Interactive line chart
- Summary statistics (current, average, min, max)

### 3. Chart Navigation Integration
**Files:** 
- `components/charts/chart-navigation.tsx`
- `app/chart/page.tsx`

Added "Volatility" option to the chart navigation menu.

**Access:** `/chart?type=volatility`

## Database Schema

New columns added to `time_series` table:
- `Value_Vol63` - 63-day annualized volatility (%)
- `Value_Vol126` - 126-day annualized volatility (%)
- `Value_Vol252` - 252-day annualized volatility (%)

## API Access

Volatility data is available through the existing API:

```
GET /api/data/equities?series=US/GSPC&columns=Value_Vol63,Value_Vol126,Value_Vol252
```

## Example Data (S&P 500)

Latest volatility (as of Feb 2026):
- 63-day: 11.51%
- 126-day: 11.06%
- 252-day: 18.51%

Historical statistics (252-day):
- Average: 14.94%
- Range: 5.17% to 45.49%

## Interpretation

- **Low volatility** (< 15%): Calm, stable markets
- **Normal volatility** (15-25%): Typical market conditions
- **High volatility** (> 25%): Stressed or crisis conditions
- **Extreme volatility** (> 40%): Major market disruptions

## Design Decision: Separate Chart vs. Combined

**Decision:** Created a separate `VolatilityChart` component instead of adding to `ReturnsChart`.

**Rationale:**
- Volatility and returns measure different concepts (risk vs. performance)
- Separate charts allow better visualization and comparison
- Users can view both simultaneously
- Cleaner code organization and maintenance
- Different y-axis scales and interpretations

## Files Created/Modified

**Created:**
- `scripts/add-volatility-metrics.ts` - Calculation script
- `scripts/README-volatility-metrics.md` - Script documentation
- `scripts/test-volatility-api.ts` - API test script
- `components/charts/volatility-chart.tsx` - Chart component
- `VOLATILITY_METRICS.md` - This file

**Modified:**
- `components/charts/chart-navigation.tsx` - Added volatility option
- `app/chart/page.tsx` - Integrated volatility chart

## Next Steps

To use this feature:

1. ✅ Run the calculation script (already done)
2. ✅ Data is available in the database
3. ✅ Chart is accessible at `/chart?type=volatility`
4. Start your dev server and navigate to the chart page

## Testing

Run the test script to verify data:
```bash
npx tsx scripts/test-volatility-api.ts
```
