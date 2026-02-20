# Volatility Chart - Date Range Presets

## Update Summary

Added date range presets to the Volatility Chart component, matching the functionality in the Equities Chart.

## Changes Made

### Date Range Presets Added

The volatility chart now includes quick-select date range buttons:

**Decade Presets:**
- 1960s (1960-01-01 to 1969-12-31)
- 1970s (1970-01-01 to 1979-12-31)
- 1980s (1980-01-01 to 1989-12-31)
- 1990s (1990-01-01 to 1999-12-31)
- 2000s (2000-01-01 to 2009-12-31)
- 2010s (2010-01-01 to 2019-12-31)
- 2020s (2020-01-01 to 2029-12-31)

**Relative Presets:**
- Last 5Y (last 5 years from today)
- Last 10Y (last 10 years from today)

**Special Presets:**
- All Time (shows all available data)
- Custom (allows manual date selection)

### Implementation Details

**State Management:**
- `datePreset`: Tracks which preset is selected
- `customStartDate` / `customEndDate`: For custom date range
- `filteredData`: Stores the filtered dataset based on selected preset

**Filtering Logic:**
- Loads all data initially
- Applies date filtering based on selected preset
- Calculates relative dates (5Y, 10Y) dynamically
- Falls back to showing all data if no data exists in selected range

**User Experience:**
- Visual feedback showing which preset is active
- Warning message when no data exists in selected range
- Statistics update to reflect filtered data range
- Smooth transitions between presets

### UI Layout

The date range controls are positioned in the top controls card, below the series selector:

```
┌─────────────────────────────────────┐
│ Time Series: [Dropdown]             │
│                                      │
│ Date Range:                          │
│ [All Time] [1960s] [1970s] ... [Custom] │
│                                      │
│ [Start Date] [End Date] (if Custom)  │
└─────────────────────────────────────┘
```

## Benefits

1. **Quick Analysis:** Jump to specific decades to analyze volatility patterns
2. **Historical Comparison:** Easily compare volatility across different eras
3. **Recent Focus:** Quickly view recent volatility with 5Y/10Y presets
4. **Flexibility:** Custom range for specific analysis needs
5. **Consistency:** Matches the UX pattern from Equities Chart

## Example Use Cases

- **1970s Analysis:** Select "1970s" to see volatility during the oil crisis and stagflation
- **2008 Crisis:** Select "2000s" to see the spike during the financial crisis
- **Recent Trends:** Select "Last 5Y" to focus on post-pandemic volatility
- **Decade Comparison:** Toggle between decades to compare volatility regimes

## Technical Notes

- Date filtering happens client-side after data load
- All data is fetched once, then filtered in memory
- Statistics (avg, min, max) recalculate based on filtered range
- Chart automatically adjusts x-axis to show filtered date range
- No additional API calls needed when changing presets

## Files Modified

- ✅ `components/charts/volatility-chart.tsx` - Added date preset functionality

## Testing

The implementation follows the same pattern as the Equities Chart, which is already tested and working in production.

To test:
1. Navigate to `/chart?type=volatility`
2. Click different date range presets
3. Verify chart updates to show selected range
4. Check that statistics reflect the filtered data
5. Try custom date range with manual dates
