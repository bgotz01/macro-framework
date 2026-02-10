# Year Selector Feature for Percentile Analysis

## Overview

Added an interactive year selector to the percentile analysis page, allowing users to view historical percentile rankings for any year-end from 1948 to present.

## Features

1. **Year Dropdown Selector** (1948-2026)
   - Select any year to view historical percentile rankings
   - Shows data as of year-end (Q4/December)
   - Real-time data fetching with loading states

2. **Interactive Chart**
   - Toggle between percentile view and actual value view
   - Show both metrics or individual series (CPI or Fed Funds)
   - Decade shading for visual context
   - Reference lines at 25th, 50th, and 75th percentiles
   - Hover tooltips with detailed information

3. **New Service Methods**
   - `getYearEndPercentile()` - Get percentiles for specific year
   - `getAvailableYears()` - List all years with data
   - `getPercentileHistory()` - Get full time series data

4. **API Endpoints**
   - `/api/percentile-year?year=YYYY` - Fetch year-specific data
   - `/api/percentile-history` - Fetch full historical data for charting
   - Returns CPI and Fed Funds percentiles

5. **Interactive Components**
   - Client-side React component with dropdown
   - Color-coded percentile displays
   - Historical context and interpretation
   - Recharts-based visualization

## Usage

### Visit the Page

Navigate to `/matrix/percentile` and use the year dropdown to explore historical data.

### Interesting Years to Explore

- **1980**: Volcker era - CPI at 94.6th percentile, Fed Funds at 99.7th
- **2008**: Financial crisis - CPI at 3.5th percentile, Fed Funds at 0.0th
- **2020**: Pandemic - CPI at 18.7th percentile, Fed Funds at 1.9th
- **2022**: Post-pandemic inflation - CPI at 85.5th percentile

## Technical Details

### Data Selection Logic

For each year, the service:
1. Looks for data in Q4 (October-December)
2. Returns the most recent data point in that range
3. Falls back to January of next year if no Q4 data exists

### Performance

- Initial page load: Server-side rendered with latest data
- Year changes: Client-side fetch (~50-100ms)
- No caching needed (data is static historical)

### State Management

- Uses React `useState` for selected year and data
- Fetches new data on year change via API
- Shows loading state during fetch

## File Structure

```
app/
├── api/
│   ├── percentile-year/
│   │   └── route.ts              # Year-specific data endpoint
│   └── percentile-history/
│       └── route.ts              # Full historical data for charts
├── matrix/
│   └── percentile/
│       └── page.tsx              # Main page (server component)
components/
├── charts/
│   └── percentile-chart.tsx      # Interactive chart component
└── percentile-viewer.tsx         # Interactive viewer (client component)
lib/
└── percentile-service.ts         # Data service with new methods
scripts/
├── calculate-percentiles.ts      # Generate percentile data
├── test-percentile-api.ts        # Test the service methods
└── test-percentile-chart-data.ts # Test chart data generation
```

## Testing

Run the test script to verify functionality:

```bash
npx tsx scripts/test-percentile-api.ts
```

This will:
- List available years
- Show percentiles for key historical years
- Display historical extremes

## Future Enhancements

Potential additions:
- [ ] Compare two years side-by-side
- [ ] Show year-over-year percentile changes
- [ ] Export year-end data to CSV
- [ ] Add more metrics beyond CPI and Fed Funds
- [ ] Add date range selector for chart
- [ ] Highlight specific historical events on chart
- [ ] Add correlation analysis between metrics
