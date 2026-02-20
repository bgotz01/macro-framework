# Volatility Chart - Spread Mode

## Feature Summary

Added a spread mode to the Volatility Chart that allows users to view the difference between different volatility periods (e.g., 1-year minus 6-month volatility).

## What is Volatility Spread?

The volatility spread shows the difference between two volatility measurements over different time periods. This can reveal important market dynamics:

- **Positive Spread (1yr > 6mo):** Long-term volatility is higher than short-term, suggesting increasing uncertainty or recent calm before potential turbulence
- **Negative Spread (1yr < 6mo):** Short-term volatility is elevated compared to long-term average, often seen during acute market stress
- **Converging Spread:** Volatility normalizing across timeframes
- **Diverging Spread:** Market regime change or structural shift in volatility

## Implementation

### Chart Modes

Users can toggle between two modes:

1. **Single Period Mode** (default)
   - View one volatility period at a time (3mo, 6mo, or 1yr)
   - Shows absolute volatility levels
   - Original functionality

2. **Spread Mode** (new)
   - Calculate and display the difference between two periods
   - Shows relative volatility dynamics
   - Helps identify volatility term structure changes

### Spread Calculations

Available spread combinations:
- **1yr - 6mo** (default): Long-term vs medium-term
- **1yr - 3mo**: Long-term vs short-term
- **6mo - 3mo**: Medium-term vs short-term

The spread is calculated as: `Period1 Volatility - Period2 Volatility`

Result is displayed in percentage points (pp).

### UI Components

**Mode Selector:**
```
Chart Mode: [Single Period] [Spread (P1 − P2)]
```

**Period Selectors (Spread Mode):**
```
Period 1: [Dropdown: 3-Month / 6-Month / 1-Year]
    −
Period 2: [Dropdown: 3-Month / 6-Month / 1-Year]
```

**Chart Title Updates:**
- Single Mode: "Historical Volatility"
- Spread Mode: "Volatility Spread"

**Chart Description Updates:**
- Single Mode: "Annualized standard deviation (percentage)"
- Spread Mode: "Difference between volatility periods (percentage points)"

### Visual Features

- Purple line color (#8b5cf6) for spread visualization
- Zero reference line to easily identify positive/negative spreads
- Tooltip shows spread value in percentage points (pp)
- Dynamic legend showing selected periods

## Use Cases

### 1. Market Stress Detection
When short-term volatility spikes above long-term (negative spread), it often signals acute market stress or crisis conditions.

**Example:** During the 2008 financial crisis, 3-month volatility exceeded 1-year volatility significantly.

### 2. Volatility Regime Changes
Persistent changes in the spread can indicate structural shifts in market volatility regimes.

**Example:** Post-2020, elevated spreads indicated a new volatility regime compared to the 2010s.

### 3. Mean Reversion Signals
Extreme spreads (very positive or very negative) often revert to mean, providing trading signals.

### 4. Risk Management
Understanding volatility term structure helps in:
- Option pricing and strategy selection
- Portfolio hedging decisions
- Risk budget allocation

## Technical Details

**Calculation:**
```typescript
Spread = Period1_Volatility - Period2_Volatility
```

**Data Handling:**
- Only includes dates where both periods have valid data
- Filters null/undefined values before calculation
- Applies date range filters to spread data
- Statistics not shown in spread mode (only in single mode)

**Type Safety:**
- TypeScript type assertions ensure proper arithmetic operations
- Null checks prevent calculation errors
- Type guards filter invalid data points

## Files Modified

- ✅ `components/charts/volatility-chart.tsx` - Added spread mode functionality

## Example Interpretations

**Scenario 1: 1yr - 6mo = +5pp**
- Long-term volatility is 5 percentage points higher than medium-term
- Market expects increased uncertainty ahead
- Recent period has been relatively calm

**Scenario 2: 1yr - 6mo = -10pp**
- Short-term volatility is 10 percentage points higher than long-term
- Acute market stress or crisis
- Volatility likely to mean-revert downward

**Scenario 3: 1yr - 6mo ≈ 0pp**
- Volatility is consistent across timeframes
- Stable volatility regime
- No significant term structure effects

## Benefits

1. **Enhanced Analysis:** View volatility dynamics, not just levels
2. **Regime Detection:** Identify changes in volatility structure
3. **Flexibility:** Choose any two periods to compare
4. **Visual Clarity:** Zero line makes interpretation intuitive
5. **Consistent UX:** Matches pattern from other chart modes

## Future Enhancements

Potential additions:
- Multiple spreads on same chart
- Historical percentile of spread values
- Spread statistics (avg, min, max)
- Alerts when spread crosses thresholds
