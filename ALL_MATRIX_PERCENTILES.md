# All Matrix Metrics - Percentile Analysis

## Overview

Extended the percentile analysis system to include all key matrix metrics, providing comprehensive historical context for macro regime classification.

## Metrics Included

### 1. **Inflation & Policy**
- **CPI Inflation** - Consumer Price Index year-over-year change
- **Fed Funds Rate** - Federal Reserve policy rate

### 2. **Bond Yields (Monthly Averages)**
- **10Y Treasury** - 10-year government bond yield
- **2Y Treasury** - 2-year government bond yield  
- **3M Treasury** - 3-month Treasury bill yield

### 3. **Equity Valuation**
- **Shiller P/E (CAPE)** - Cyclically Adjusted Price-to-Earnings ratio

### 4. **Derived Metrics**
- **Real Yield** - 10Y Treasury minus CPI (real return on bonds)
- **Yield Curve** - 10Y minus 2Y spread (term premium)
- **Earnings Yield Premium** - (E/P) minus 3M Treasury (equity risk premium vs cash)
- **Real Earnings Yield** - (E/P) minus CPI (real return on equities)

## Data Processing

### Monthly Averaging for Bond Yields

Created monthly average series for bond yields to match CPI frequency:

```typescript
// Example: US/TNX-Monthly
// Takes all daily 10Y Treasury values in a month
// Calculates average and stores as single monthly value
// Dated to the 1st of each month
```

**Benefits:**
- Consistent frequency across all metrics (monthly)
- Reduces noise from daily volatility
- More meaningful percentile comparisons
- Aligns with CPI reporting schedule

### Derived Metric Calculations

Calculated from existing percentile data:

```sql
-- Real Yield = 10Y - CPI
SELECT 
    pa1.date,
    pa1.value - pa2.value as real_yield
FROM percentile_analysis pa1
INNER JOIN percentile_analysis pa2 ON pa1.date = pa2.date
WHERE pa1.series_name = 'US/TNX-Monthly'
  AND pa2.series_name = 'CPI'
```

## Current Percentile Rankings

As of latest data:

| Metric | Value | Percentile | Interpretation |
|--------|-------|------------|----------------|
| CPI | 2.65% | 44.3th | Below average inflation |
| Fed Funds | 3.64% | 42.6th | Below average rates |
| 10Y Treasury | 4.26% | 35.5th | Below average yields |
| 2Y Treasury | 3.96% | 39.9th | Below average yields |
| 3M Treasury | 3.59% | 39.5th | Below average yields |
| Shiller P/E | 39.12x | **98.8th** | **Extremely high valuation** |
| Real Yield | 1.49% | 39.6th | Below average real return |
| Yield Curve | 0.32% | 32.3th | Below average steepness |
| Earnings Yield Premium | -1.30% | **16.0th** | **Bonds more attractive than stocks** |
| Real Earnings Yield | -0.41% | **10.3th** | **Very low real equity return** |

## Key Insights

### Valuation Extremes

**Shiller P/E at 98.8th percentile:**
- Only 1.2% of historical observations were higher
- Indicates extreme equity valuation
- Historically associated with lower forward returns

**Earnings Yield Premium at 16th percentile:**
- Negative premium means bonds yield more than stocks
- Unusual configuration
- Reflects combination of high valuations and elevated rates

**Real Earnings Yield at 10th percentile:**
- After adjusting for inflation, equity earnings yield is very low
- Only 10% of history had lower real equity returns
- Suggests challenging environment for equity investors

### Rate Environment

**All yields in 30-40th percentile range:**
- Below historical median but not extreme
- Normalized from ZIRP era (2010s)
- Still below pre-2008 averages

## Scripts

### 1. Create Monthly Bond Yields
```bash
npx tsx scripts/create-monthly-bond-yields.ts
```

Creates monthly average series for:
- US/TNX-Monthly (10Y)
- US/US-2yr-Monthly (2Y)
- US/IRX-Monthly (3M)

### 2. Calculate Base Percentiles
```bash
npx tsx scripts/calculate-percentiles.ts
```

Calculates percentiles for:
- CPI, Fed Funds
- Monthly bond yields
- Shiller P/E

### 3. Create Derived Percentiles
```bash
npx tsx scripts/create-derived-percentiles.ts
```

Calculates percentiles for:
- Real Yield
- Yield Curve
- Earnings Yield Premium
- Real Earnings Yield

### 4. Test All Data
```bash
npx tsx scripts/test-all-percentiles.ts
```

Displays latest values and percentiles for all metrics.

## Chart Integration

The percentile chart now supports all 10 metrics:

- **Dropdown for view mode** - Percentile or Actual Value
- **Checkboxes for series selection** - Select any combination
- **Dynamic rendering** - Lines and tooltips adapt to selection
- **Color-coded** - Each metric has distinct color
- **Scrollable series list** - Compact 2-column grid

## Database Schema

All percentile data stored in `percentile_analysis` table:

```sql
CREATE TABLE percentile_analysis (
    id INTEGER PRIMARY KEY,
    date INTEGER NOT NULL,
    asset_class TEXT NOT NULL,  -- 'economic', 'bonds', 'valuations', 'derived'
    series_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    value REAL,
    percentile_rank REAL,
    UNIQUE(date, asset_class, series_name, column_name)
);
```

**Asset Classes:**
- `economic` - CPI, Fed Funds
- `bonds` - Treasury yields (monthly averages)
- `valuations` - Shiller P/E
- `derived` - Calculated metrics (Real Yield, Yield Curve, etc.)

## Usage in Matrix Analysis

These percentiles provide historical context for regime classification:

**Example: Current Environment (Feb 2026)**

| Dimension | Metric | Percentile | Regime |
|-----------|--------|------------|--------|
| Inflation | CPI | 44th | Normal/Low |
| Policy | Fed Funds | 43rd | Neutral |
| Nominal Yields | 10Y | 36th | Below Average |
| Real Yields | Real Yield | 40th | Below Average |
| Equity Valuation | Shiller P/E | **99th** | **Extreme** |
| Equity Premium | EYP | **16th** | **Compressed** |

**Interpretation:**
- Inflation and rates normalized from pandemic extremes
- Yields below long-term averages but not extreme
- **Equity valuations at historic highs**
- **Risk premium compressed** - stocks expensive relative to bonds
- Challenging setup for equity investors

## Future Enhancements

- [ ] Add VIX percentiles (need monthly averaging)
- [ ] Add credit spreads (HYG, LQD)
- [ ] Add commodity percentiles (Gold, Oil)
- [ ] Add FX percentiles (DXY)
- [ ] Create regime classification based on percentile combinations
- [ ] Add alerts for extreme percentile readings
- [ ] Historical regime analysis by percentile ranges
