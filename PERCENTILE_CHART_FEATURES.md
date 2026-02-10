# Percentile Chart Features

## Overview

Added an interactive chart to visualize percentile rankings over time, showing how CPI and Fed Funds rates have moved through their historical distributions.

## Chart Features

### 1. Dual View Modes

**Percentile View** (default)
- Shows where values rank in their historical distribution (0-100th percentile)
- Reference lines at 25th, 50th, and 75th percentiles
- Helps identify extreme vs normal periods

**Actual Value View**
- Shows the raw CPI and Fed Funds rate values
- Useful for seeing absolute levels alongside percentile context

### 2. Series Selection

- **Both**: Display CPI and Fed Funds together
- **CPI Only**: Focus on inflation percentiles
- **Fed Funds Only**: Focus on policy rate percentiles

### 3. Visual Elements

**Decade Shading**
- Subtle background colors for each decade (1950s-2020s)
- Helps identify era-specific patterns

**Reference Lines** (Percentile view only)
- 25th percentile (green) - Bottom quartile threshold
- 50th percentile (gray) - Median
- 75th percentile (red) - Top quartile threshold

**Interactive Tooltips**
- Hover over any point to see exact values
- Shows date, percentile rank, and actual value

### 4. Responsive Design

- Adapts to screen size
- Dark mode support
- Clean, minimal interface

## Key Insights from the Chart

### Decade Analysis

**1970s - Stagflation Era**
- CPI: 63-100th percentile (avg 86.4th)
- Fed Funds: 44-100th percentile (avg 83.2nd)
- Both metrics in historically high ranges

**1980s - Volcker Era**
- CPI: 18-100th percentile (avg 62.4th)
- Fed Funds: 57-100th percentile (avg 79.2nd)
- Peak rates fighting inflation

**2000s - Great Moderation**
- CPI: 1-79th percentile (avg 40.4th)
- Fed Funds: 0-65th percentile (avg 22.9th)
- Return to lower ranges

**2010s - Post-GFC**
- CPI: 4-65th percentile (avg 27.3rd)
- Fed Funds: 0-27th percentile (avg 8.8th)
- Historically low across the board

**2020s - Pandemic Era**
- CPI: 6-93rd percentile (avg 57.2nd)
- Fed Funds: 0-64th percentile (avg 33.3rd)
- Spike and normalization

## Technical Implementation

### Data Flow

1. **API Endpoint**: `/api/percentile-history`
   - Fetches full time series from database
   - Merges CPI and Fed Funds data by date
   - Returns ~1,872 data points

2. **Chart Component**: `components/charts/percentile-chart.tsx`
   - Client-side React component
   - Uses Recharts library
   - Manages view state (metric, series)

3. **Service Layer**: `lib/percentile-service.ts`
   - `getPercentileHistory()` method
   - Efficient database queries
   - Type-safe data structures

### Performance

- Initial load: ~100-200ms (1,872 data points)
- Chart rendering: Smooth with Recharts optimization
- No pagination needed (data size manageable)

### Chart Configuration

```typescript
// Decade shading colors
const DECADE_COLORS = [
    { start: '1950-01-01', end: '1959-12-31', color: '#3b82f6', opacity: 0.03 },
    { start: '1960-01-01', end: '1969-12-31', color: '#8b5cf6', opacity: 0.03 },
    // ... more decades
];

// Line colors
CPI: #2563eb (blue)
Fed Funds: #dc2626 (red)

// Reference lines (percentile view)
25th: #10b981 (green)
50th: #6b7280 (gray)
75th: #ef4444 (red)
```

## Usage Examples

### Analyzing Historical Extremes

1. Switch to **Percentile View**
2. Select **Both** series
3. Look for periods where lines are near 0 or 100
4. Hover to see exact dates and values

**Example findings:**
- 1980: Both metrics at 95-100th percentile (Volcker peak)
- 2008-2009: Both metrics at 0-5th percentile (crisis lows)
- 2022: CPI at 85-93rd percentile (post-pandemic spike)

### Comparing Metrics

1. Switch to **Actual Value View**
2. Select **Both** series
3. Observe how CPI and Fed Funds move together or diverge

**Example patterns:**
- 1970s: Both rising together (stagflation)
- 1980s: Fed Funds leads CPI down (policy working)
- 2010s: Both at historic lows (ZIRP era)

### Focusing on Single Metric

1. Select **CPI Only** or **Fed Funds Only**
2. Switch between Percentile and Value views
3. Identify long-term trends and cycles

## Integration with Year Selector

The chart complements the year selector:
- **Year Selector**: Point-in-time snapshot
- **Chart**: Full historical context and trends

Together they provide:
- Specific year-end values (selector)
- Evolution over time (chart)
- Visual pattern recognition (chart)
- Precise numerical data (selector)

## Future Enhancements

Potential additions:
- [ ] Zoom and pan functionality
- [ ] Date range selector
- [ ] Export chart as image
- [ ] Highlight specific events (recessions, policy changes)
- [ ] Add more metrics (10Y yields, VIX, etc.)
- [ ] Correlation heatmap view
- [ ] Percentile bands (show 25-75th range as shaded area)
- [ ] Compare current period to historical averages
