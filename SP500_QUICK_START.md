# S&P 500 Quick Start Guide

## What's Been Set Up

The S&P 500 constituent tracking system is now fully integrated into your macro-data.db database with:

✅ Two new database tables:
- `sp500_constituents` - Current 503 companies
- `sp500_changes` - 359 historical changes

✅ Import script to load CSV data
✅ Three analytics scripts with different insights
✅ Three API endpoints for data access
✅ Web interface at `/sp500`
✅ NPM scripts for easy access

## Quick Commands

```bash
# Import/re-import S&P 500 data
npm run import-sp500

# Run analytics
npm run sp500-analytics          # Basic analytics
npm run sp500-advanced           # Advanced insights
npm run sp500-rotation           # Sector rotation analysis
npm run sp500-snapshots          # Historical snapshots at key dates
```

## View the Data

1. **Web Interface**: Visit `http://localhost:3000/sp500`
   - Overview with charts
   - Full constituent list with filtering
   - **Historical view**: Select any year-end date (2000-2025) to see constituents at that point in time
   - Historical changes timeline

2. **API Endpoints**:
   - `/api/sp500/constituents` - Get current companies
   - `/api/sp500/constituents?asOfDate=2012-12-31` - Get historical constituents
   - `/api/sp500/constituents?sector=Information%20Technology` - Filter by sector
   - `/api/sp500/constituents?sector=Financials&asOfDate=2019-12-31` - Historical + sector filter
   - `/api/sp500/changes?limit=50` - Recent changes
   - `/api/sp500/analytics` - Summary statistics

## Key Insights Available

### Current Composition
- 503 companies across 11 sectors
- 127 sub-industries
- 53 original 1957 members still in index

### Historical Reconstruction
- View index composition at any year-end from 2000-2025
- Track sector rotation over time
- See which companies were added/removed between dates
- Example: Only 182 companies tracked at end of 2000, grew to 487 by end of 2025

### Sector Breakdown
- Industrials: 79 companies (15.71%)
- Financials: 76 companies (15.11%)
- Information Technology: 71 companies (14.12%)
- Top 3 sectors = 44.94% of index

### Historical Patterns
- 359 total changes tracked
- Acquisitions: 126 removals
- Market cap changes: 123 removals
- 10 companies have returned after being removed

### Recent Trends (2020-2026)
- Tech dominance: 24 new additions
- Industrials: 15 additions
- Financials: 12 additions

## Example Queries

### Find all tech companies
```sql
SELECT symbol, security FROM sp500_constituents 
WHERE gics_sector = 'Information Technology'
ORDER BY security;
```

### Recent changes
```sql
SELECT * FROM sp500_changes 
WHERE date LIKE '%25' OR date LIKE '%26'
ORDER BY date DESC;
```

### Companies by state
```sql
SELECT headquarters_location, COUNT(*) as count
FROM sp500_constituents
WHERE headquarters_location LIKE '%California%'
GROUP BY headquarters_location;
```

## Analytics Scripts Output

### Basic Analytics (`npm run sp500-analytics`)
- Sector composition with percentages
- Annual turnover rates
- Top removal reasons
- Longest tenured companies
- Recent changes
- Top sub-industries

### Advanced Analytics (`npm run sp500-advanced`)
- Survival rate by decade
- Most active years for changes
- Companies that returned to index
- Acquisition activity trends
- Geographic concentration
- Company age distribution
- Oldest companies

### Sector Rotation (`npm run sp500-rotation`)
- Sector trends over time
- Tech sector growth analysis
- Financial sector patterns
- Energy sector decline
- Concentration risk metrics
- Volatility by sector

## Next Steps

You mentioned wanting to create analytics. Here are some ideas:

1. **Sector Performance Correlation**
   - Link S&P 500 sector composition to your macro data
   - Analyze which sectors dominate during different economic regimes

2. **Turnover Rate Analysis**
   - Calculate annual churn rate
   - Correlate with market volatility or economic cycles

3. **Survival Analysis**
   - Predict which companies might be removed
   - Analyze characteristics of long-tenured vs short-tenured companies

4. **Geographic Trends**
   - Map headquarters locations
   - Analyze regional economic impact

5. **Age vs Performance**
   - Compare old vs new companies
   - Innovation vs stability metrics

6. **M&A Activity Tracking**
   - Acquisition trends over time
   - Which sectors see most consolidation

## Files Created

- `lib/sp500-schema.sql` - Database schema
- `scripts/import-sp500-data.ts` - Import script
- `scripts/sp500-analytics.ts` - Basic analytics
- `scripts/sp500-advanced-analytics.ts` - Advanced insights
- `scripts/sp500-sector-rotation.ts` - Sector analysis
- `app/api/sp500/constituents/route.ts` - API endpoint
- `app/api/sp500/changes/route.ts` - API endpoint
- `app/api/sp500/analytics/route.ts` - API endpoint
- `app/sp500/page.tsx` - Web interface
- `SP500_TRACKING.md` - Full documentation
- `SP500_QUICK_START.md` - This file

## Data Sources

- `data/SP500/SP500.csv` - Current constituents (503 companies)
- `data/SP500/SP500Changes.csv` - Historical changes (359 records)

Both files are tracked and can be updated as needed. Re-run `npm run import-sp500` after updates.
