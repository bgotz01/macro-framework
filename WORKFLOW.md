# Data Import Workflow

This document explains the complete process for importing new data series into the macro-data SQLite database.

## Overview

The data import process consists of three main steps:
1. **Prepare CSV files** in the correct format
2. **Update metadata** to describe the series
3. **Convert and import** data into the database

## Step 1: Prepare CSV Files

### File Location
Place CSV files in the appropriate asset class directory:
- `data/economic/` - Economic indicators (GDP, CPI, debt, etc.)
- `data/equities/` - Stock market indices
- `data/bonds/` - Bond yields and rates
- `data/commodities/` - Commodity prices
- `data/fx/` - Foreign exchange rates
- `data/crypto/` - Cryptocurrency prices
- `data/volatility/` - Volatility indices

### Required CSV Format
All CSV files must have exactly two columns:
```csv
Date,Value
2024-01-01,100.5
2024-02-01,102.3
```

**Important:**
- Column names must be exactly `Date` and `Value` (case-sensitive)
- Date format: `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`
- Values should be numeric (no commas or currency symbols)
- Empty or zero values will be skipped during import

### FRED Data Format
If downloading from FRED, files typically come in this format:
```csv
observation_date,SERIESCODE
2024-01-01,100.5
```

These need to be converted (see Step 3).

## Step 2: Update Metadata

Edit `data/series-metadata.json` to add information about your new series.

### Metadata Structure
```json
{
  "economic": {
    "SERIESCODE": {
      "displayName": "Human-Readable Name",
      "description": "Detailed description of the series",
      "geography": "US",
      "frequency": "monthly",
      "units": "billions"
    }
  }
}
```

### Metadata Fields
- **displayName**: Short, user-friendly name shown in charts
- **description**: Full description of what the series measures
- **geography**: Geographic region (US, UK, JP, etc.) - optional
- **frequency**: Data frequency (daily, monthly, quarterly, annual) - optional
- **units**: Unit of measurement (see below)

### Common Units
- `billions` - Monetary values in billions
- `millions` - Monetary values in millions
- `percent` - Percentage values
- `index` - Index values
- `ratio` - Ratios (like P/E)
- `usd` - US Dollar amounts
- `exchange_rate` - FX rates

## Step 3: Convert and Import Data

### For FRED Economic Data

If you have FRED format files, use the conversion script:

1. **Add series code to the conversion script**
   
   Edit `scripts/convert-fred-economic.ts`:
   ```typescript
   const FRED_SERIES = [
       'EXISTING_SERIES',
       'YOUR_NEW_SERIES',  // Add here
   ];
   ```

2. **Run the conversion**
   ```bash
   npx tsx scripts/convert-fred-economic.ts
   ```

### For Data Requiring Unit Conversion

If your data needs conversion (e.g., millions to billions):

1. **Create a conversion script** (or modify existing one)
   
   Example: `scripts/convert-deficit-data.ts`
   ```typescript
   const transformedData = data.map(row => ({
       Date: row.observation_date,
       Value: (row.SERIESCODE! / 1000).toFixed(3) // millions → billions
   }));
   ```

2. **Run your conversion script**
   ```bash
   npx tsx scripts/convert-your-data.ts
   ```

### Import into Database

Once CSV files are in the correct format:

```bash
npx tsx scripts/import-data.ts
```

This script will:
- Scan all asset class directories for CSV files
- Validate the format (Date, Value columns)
- Import data into the SQLite database
- Update series metadata
- Skip zero or empty values
- Show progress and any errors

## Step 4: Verify Import

### Check the database
```bash
sqlite3 data/macro-data.db "SELECT series_name, display_name, COUNT(*) as rows FROM time_series JOIN series_metadata USING (asset_class, series_name) WHERE series_name = 'YOUR_SERIES' GROUP BY series_name, display_name"
```

### View sample data
```bash
sqlite3 data/macro-data.db "SELECT datetime(date/1000, 'unixepoch') as date, value FROM time_series WHERE series_name = 'YOUR_SERIES' ORDER BY date DESC LIMIT 5"
```

## Common Workflows

### Adding a New FRED Economic Series

1. Download CSV from FRED
2. Place in `data/economic/SERIESCODE.csv`
3. Add to `scripts/convert-fred-economic.ts`
4. Add metadata to `data/series-metadata.json`
5. Run: `npx tsx scripts/convert-fred-economic.ts`
6. Run: `npx tsx scripts/import-data.ts`

### Adding Stock Market Data

1. Export data in Date,Value format
2. Place in `data/equities/US/TICKER.csv` (or appropriate subdirectory)
3. Add metadata to `data/series-metadata.json` under `equities`
4. Run: `npx tsx scripts/import-data.ts`

### Converting Units (Millions to Billions)

1. Place original CSV in appropriate directory
2. Create/modify conversion script to divide by 1000
3. Update metadata with `"units": "billions"`
4. Run conversion script
5. Run: `npx tsx scripts/import-data.ts`

## Database Schema

The SQLite database has two main tables:

### time_series
- `date` (INTEGER) - Unix timestamp in milliseconds
- `asset_class` (TEXT) - Category (economic, equities, etc.)
- `series_name` (TEXT) - Series identifier
- `column_name` (TEXT) - Always 'Value'
- `value` (REAL) - The data point

### series_metadata
- `asset_class` (TEXT)
- `series_name` (TEXT)
- `display_name` (TEXT)
- `description` (TEXT)
- `geography` (TEXT)
- `units` (TEXT)
- `last_updated` (INTEGER)

## Troubleshooting

### "Missing Date column" error
- Ensure your CSV has a column named exactly `Date` (capital D)
- Check for extra spaces in column names

### "Missing Value column" error
- Ensure your CSV has a column named exactly `Value` (capital V)
- Make sure it's the second column

### "Too many columns" error
- CSV should have only 2 columns: Date and Value
- Remove any extra columns

### No data imported
- Check for zero values (they're skipped)
- Verify date format is valid
- Look for empty rows or invalid data

### Data appears incorrect
- Verify unit conversions (millions vs billions)
- Check if percentages need to be divided by 100
- Confirm date parsing is correct

## Example: Complete Workflow

Here's the complete workflow we used to add federal deficit data:

```bash
# 1. Files already in data/economic/
#    - FYFSD.csv (millions)
#    - FYFSGDA188S.csv (percent)

# 2. Created conversion script
cat > scripts/convert-deficit-data.ts << 'EOF'
#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Convert FYFSD from millions to billions
// Convert FYFSGDA188S to Date,Value format
EOF

# 3. Updated metadata
# Added entries to data/series-metadata.json

# 4. Ran conversion
npx tsx scripts/convert-deficit-data.ts

# 5. Imported to database
npx tsx scripts/import-data.ts

# 6. Verified
sqlite3 data/macro-data.db "SELECT series_name, COUNT(*) FROM time_series WHERE series_name IN ('FYFSD', 'FYFSGDA188S') GROUP BY series_name"
```

## Best Practices

1. **Always backup** the database before bulk imports
2. **Test with one series** before batch processing
3. **Verify units** match the metadata
4. **Check date ranges** make sense for the data
5. **Document sources** in `data/Sources.md`
6. **Use consistent naming** (FRED codes when applicable)
7. **Keep original files** in case you need to re-import

## Related Scripts

- `scripts/import-data.ts` - Main import script
- `scripts/convert-fred-economic.ts` - Convert FRED format
- `scripts/convert-millions-to-billions.ts` - Unit conversion
- `scripts/query-db.ts` - Query the database
- `scripts/list-series.ts` - List all series in database



# BUILD TIMELINE
npx tsx scripts/build-regime-timeline.ts
