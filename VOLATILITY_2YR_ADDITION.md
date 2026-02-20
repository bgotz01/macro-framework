# 2-Year Volatility Addition

## Summary

Added 504-day (2-year) rolling standard deviation to the volatility metrics in both the database and the chart interface.

## Changes Made

### 1. Database Script Updates

**File:** `scripts/add-volatility-metrics.ts`
- Added calculation for 504-day rolling volatility
- Maintains same methodology as other periods (annualized standard deviation)

**New Script:** `scripts/add-504day-volatility.ts`
- Standalone script to add only 504-day data to existing database
- Useful for updating without recalculating all periods

**Data Added:**
- 504-day volatility for all 10 equity indexes
- Total: ~130,000+ new data points across all series
- Column name: `Value_Vol504`

### 2. Chart Component Updates

**File:** `components/charts/volatility-chart.tsx`

**Interface Updates:**
- Added `'504-Day Vol'` to `VolatilityDataPoint` interface
- Added purple color (#8b5cf6) for 504-day line in `CHART_COLORS`

**State Updates:**
- Updated type definitions to include `'504'` option
- `selectedPeriod`: `'63' | '126' | '252' | '504'`
- `spreadPeriod1` and `spreadPeriod2`: Same type update

**UI Updates:**
- Added "2-Year" button to single period selector
- Added "2-Year" option to both spread dropdowns
- Updated stats grid from 3 columns to 4 columns
- Added 504-day Line component for chart rendering

**Data Fetching:**
- Updated API call to include `Value_Vol504` column
- Updated data transformation to map 504-day values

**Label Logic:**
- Updated period label functions to handle 504 → '2yr'

### 3. Documentation Updates

**File:** `scripts/README-volatility-metrics.md`
- Updated to reflect four time windows instead of three
- Added 504-day to output columns list
- Updated API endpoint example

## Why 504 Days?

504 trading days represents approximately 2 years of market data:
- 252 trading days per year (standard assumption)
- 252 × 2 = 504 days
- Accounts for weekends and holidays

## Use Cases for 2-Year Volatility

1. **Long-term Trend Analysis**
   - Smooths out short-term noise
   - Better for identifying structural volatility regimes
   - Less reactive to temporary market events

2. **Volatility Term Structure**
   - Compare 2yr vs 1yr vs 6mo vs 3mo
   - Identify volatility curve shape (upward/downward sloping)
   - Spot regime transitions

3. **Strategic Asset Allocation**
   - Long-term investors care about multi-year volatility
   - Better for pension funds and endowments
   - Aligns with strategic planning horizons

4. **Spread Analysis**
   - 2yr - 1yr spread shows long-term trend changes
   - 2yr - 6mo spread highlights major regime shifts
   - Useful for identifying persistent vs transient volatility

## Data Verification

**S&P 500 (US/GSPC):**
- Total 504-day volatility points: 16,130
- Latest value: ~15.92%
- Data range: From 504 days after first price point to present

**All Equity Indexes:**
- DJI: 33,393 points
- FTSE: 10,130 points
- GDAXI: 9,130 points
- HSI: 9,147 points
- N225: 14,515 points
- NDX: 9,667 points
- US/DJI: 8,081 points
- US/GSPC: 16,130 points
- US/IXIC: 13,363 points
- US/RUT: 9,171 points

## Example Interpretations

**2-Year Volatility at 15%:**
- Relatively low for equities
- Suggests stable, low-volatility regime
- Typical of bull markets or calm periods

**2-Year Volatility at 25%:**
- Elevated but not extreme
- May indicate recent crisis or ongoing uncertainty
- Common during recovery periods

**2-Year Volatility at 35%+:**
- Very high, crisis-level volatility
- Seen during 2008, 2020, 1970s
- Indicates major structural market stress

## Spread Examples

**2yr - 1yr = +5pp:**
- Long-term volatility expectations rising
- Market anticipating future turbulence
- Could signal regime change ahead

**2yr - 1yr = -5pp:**
- Recent volatility spike above long-term average
- Likely mean-reverting situation
- Short-term stress in otherwise stable regime

**2yr - 6mo = +10pp:**
- Very significant divergence
- Recent period unusually calm
- Or long-term structural volatility increase

## Files Modified

- ✅ `scripts/add-volatility-metrics.ts` - Added 504-day calculation
- ✅ `scripts/add-504day-volatility.ts` - New standalone script
- ✅ `components/charts/volatility-chart.tsx` - Full 504-day integration
- ✅ `scripts/README-volatility-metrics.md` - Updated documentation

## Testing

Run the test script to verify:
```bash
npx tsx scripts/test-volatility-api.ts
```

Or query directly:
```bash
sqlite3 data/macro-data.db "SELECT date, value FROM time_series WHERE column_name = 'Value_Vol504' AND series_name = 'US/GSPC' ORDER BY date DESC LIMIT 5;"
```

## Next Steps

The 2-year volatility is now fully integrated and available for:
- Single period viewing in the chart
- Spread calculations with any other period
- API access for external analysis
- Historical analysis and backtesting
