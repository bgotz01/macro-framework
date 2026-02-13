# S&P 500 Tracking System

This system tracks S&P 500 constituents and historical changes in the SQLite database.

## Database Tables

### `sp500_constituents`
Current S&P 500 member companies with:
- Symbol, company name, sector, sub-industry
- Headquarters location
- Date added to index
- CIK number, founding year

### `sp500_changes`
Historical record of all additions/removals with:
- Date of change
- Added/removed ticker and company name
- Reason for change (acquisition, market cap, spin-off, etc.)

## Scripts

### Import Data
```bash
npx tsx scripts/import-sp500-data.ts
```
Imports both CSV files into the database. Run this after updating the CSV files.

### Analytics
```bash
# Run all analytics
npx tsx scripts/sp500-analytics.ts

# Run specific analysis
npx tsx scripts/sp500-analytics.ts sectors
npx tsx scripts/sp500-analytics.ts turnover
npx tsx scripts/sp500-analytics.ts reasons
npx tsx scripts/sp500-analytics.ts tenure
npx tsx scripts/sp500-analytics.ts recent
npx tsx scripts/sp500-analytics.ts concentration
```

## API Endpoints

### Get Constituents
```
GET /api/sp500/constituents
GET /api/sp500/constituents?sector=Information%20Technology
GET /api/sp500/constituents?asOfDate=2012-12-31
GET /api/sp500/constituents?sector=Financials&asOfDate=2019-12-31
```

The `asOfDate` parameter allows you to reconstruct the index at any historical date. The API will:
1. Include all companies added before or on that date
2. Exclude companies that were removed before or on that date
3. Return the count of constituents at that point in time

### Get Historical Changes
```
GET /api/sp500/changes?limit=50
GET /api/sp500/changes?year=2025
```

### Get Analytics
```
GET /api/sp500/analytics
```
Returns sector breakdown, top sub-industries, removal reasons, and stats.

## Web Interface

Visit `/sp500` to see:
- Overview with sector breakdown and analytics
- Full constituent list with filtering by sector
- **Historical view**: Dropdown to select any year-end date (2000-2025) to see index composition at that time
- Historical changes timeline

The historical view reconstructs the index by:
- Including companies added before the selected date
- Excluding companies removed before the selected date
- Showing accurate constituent count for that point in time

## Data Sources

- `data/SP500/SP500.csv` - Current constituents
- `data/SP500/SP500Changes.csv` - Historical changes

## Analytics Available

1. **Sector Composition** - Distribution across 11 GICS sectors
2. **Annual Turnover** - Additions/removals by year
3. **Removal Reasons** - Why companies leave (acquisition, market cap, etc.)
4. **Tenure Analysis** - Original 1957 members still in index
5. **Recent Changes** - Latest additions/removals
6. **Industry Concentration** - Top sub-industries by company count

## Example Queries

### Find all tech companies
```sql
SELECT symbol, security FROM sp500_constituents 
WHERE gics_sector = 'Information Technology'
ORDER BY security;
```

### Companies added in 2025
```sql
SELECT c.date, c.added_ticker, c.added_company, c.reason
FROM sp500_changes c
WHERE c.date LIKE '%25'
ORDER BY c.date DESC;
```

### Longest tenured companies
```sql
SELECT symbol, security, date_added 
FROM sp500_constituents 
WHERE date_added = '1957-03-04'
ORDER BY security;
```

### Sector concentration
```sql
SELECT gics_sector, COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) as pct
FROM sp500_constituents
GROUP BY gics_sector
ORDER BY count DESC;
```

## Future Analytics Ideas

1. **Survival Analysis** - Average tenure by sector
2. **Acquisition Trends** - M&A activity over time
3. **Market Cap Changes** - Track removals due to size
4. **Sector Rotation** - How sector composition changes over decades
5. **Geographic Analysis** - Headquarters distribution
6. **Age Analysis** - Founded year distribution
7. **Churn Rate** - Annual turnover percentage
8. **Replacement Patterns** - What sectors replace what sectors
