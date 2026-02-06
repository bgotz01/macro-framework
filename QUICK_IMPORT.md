# Quick Import Guide

## Adding New Data

### 1. Create Your CSV File

Format: `{Country}-{Metric}.csv`

```csv
Date,Value
2020-01-01,1.5
2020-01-02,1.52
2020-01-03,1.48
```

### 2. Place in Correct Folder

```
data/
├── bonds/       → Government bonds, yields, spreads
├── equities/    → Stock indexes
├── fx/          → Currency pairs
├── macro/       → CPI, GDP, unemployment, etc.
└── moneysupply/ → M1, M2, M3
```

### 3. Run Import

```bash
pnpm import-data
```

That's it! The data is now in the database and available in the UI.

## Examples

### Adding German 10-Year Yield

1. Create `data/bonds/Germany-10yr.csv`:
```csv
Date,Value
2020-01-01,0.25
2020-01-02,0.26
```

2. Run: `pnpm import-data`

3. View at: http://localhost:3000/chart
   - Select: Bonds → Germany-10yr

### Adding UK CPI

1. Create `data/macro/UK-CPI.csv`:
```csv
Date,Value
2020-01-01,108.5
2020-02-01,108.9
```

2. Run: `pnpm import-data`

3. Done!

## Updating Existing Data

Just edit the CSV file and run `pnpm import-data` again. It will replace the old data.

## Validation

The import script checks:
- ✅ File has `Date` and `Value` columns
- ✅ Dates are valid
- ✅ Values are numeric
- ⚠️  Warns about skipped rows
- ❌ Errors on invalid format

## Tips

- Use ISO dates (YYYY-MM-DD) for consistency
- One metric per file
- Use hyphens in filenames (not spaces)
- Keep country names consistent (US, UK, Germany, Japan, Euro)
