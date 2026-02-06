# Data Folder Structure

## Overview

Each CSV file represents **one time series** for **one country/region** and **one metric**.

## File Naming Convention

```
{Country}-{Metric}.csv
```

Examples:
- `US-10yr.csv` - US 10-year Treasury yield
- `Germany-10yr.csv` - German 10-year Bund yield
- `US-CPI.csv` - US Consumer Price Index
- `Japan-M2.csv` - Japan M2 money supply

## CSV Format

All files must have exactly 2 columns:

```csv
Date,Value
2020-01-01,1.5
2020-01-02,1.52
```

- **Date**: ISO format (YYYY-MM-DD) or M/D/YY
- **Value**: Numeric value for that date

## Directory Structure

```
data/
├── bonds/
│   ├── US/
│   │   ├── US-10yr.csv
│   │   ├── US-2yr.csv
│   │   └── US-10-2yr-Spread.csv
│   ├── Germany/
│   │   └── Germany-10yr.csv
│   └── Japan/
│       └── Japan-10yr.csv
│
├── equities/
│   ├── US/
│   │   ├── SPX.csv
│   │   └── DJI.csv
│   └── Germany/
│       └── DAX.csv
│
├── fx/
│   ├── EURUSD.csv
│   └── GBPUSD.csv
│
├── macro/
│   ├── US/
│   │   ├── US-CPI.csv
│   │   └── US-GDP.csv
│   └── Germany/
│       └── Germany-CPI.csv
│
└── moneysupply/
    ├── US/
    │   ├── US-M1.csv
    │   └── US-M2.csv
    └── Euro/
        └── Euro-M1.csv
```

## Adding New Data

1. Create a CSV file with the naming convention: `{Country}-{Metric}.csv`
2. Ensure it has `Date,Value` columns
3. Place it in the appropriate asset class folder
4. Run: `pnpm import-data`

## Examples

### US 10-Year Treasury Yield
**File**: `data/bonds/US/US-10yr.csv`
```csv
Date,Value
1962-01-02,4.06
1962-01-03,4.03
```

### Euro/USD Exchange Rate
**File**: `data/fx/EURUSD.csv`
```csv
Date,Value
2020-01-01,1.1234
2020-01-02,1.1245
```

### US Consumer Price Index
**File**: `data/macro/US/US-CPI.csv`
```csv
Date,Value
2020-01-01,258.678
2020-02-01,259.101
```

## Rules

✅ **DO**:
- Organize by country in subdirectories (bonds/US/, bonds/Germany/)
- Use consistent country names (US, Germany, Japan, UK, Euro)
- Use clear metric names (10yr, 2yr, CPI, M1, M2, SPX, DJI)
- Keep one metric per file
- Use Date,Value format
- Zero values will be automatically filtered out

❌ **DON'T**:
- Mix multiple metrics in one file
- Use inconsistent date formats
- Include empty columns
- Use spaces in filenames (use hyphens)
- Include zero values (they'll be skipped)

## Import Script

After adding/updating files, run:

```bash
pnpm import-data
```

This will:
1. Scan all CSV files in data/ folders
2. Validate format (Date,Value columns)
3. Import into SQLite database
4. Create indexes for fast queries
5. Report any errors or warnings
