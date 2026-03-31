# Data Update Guide

Complete guide for updating all financial data in the macro framework application.

## Overview

This application tracks multiple asset classes with data sourced from Yahoo Finance and FRED. Data is stored in CSV files and imported into a SQLite database for efficient querying.

## Quick Start - Update All Data (Incremental Only)

```bash
# 1. Update all data from Yahoo Finance (recommended)
python scripts/batch_update_all.py

# 2. Import new data into database
npx tsx scripts/import-data-incremental.ts

# 3. Calculate cyclical returns (for returns chart - 2Y, 5Y, 10Y returns)
npx tsx scripts/add-cyclical-returns.ts

# 4. Calculate volatility metrics (for volatility chart - 63d, 126d, 252d, 504d)
npx tsx scripts/add-volatility-metrics.ts

# 5. Recalculate percentiles (optional, if needed)
npx tsx scripts/calculate-percentiles.ts

# 6. Economic data
npx tsx scripts/import-new-economic-data.ts


# 6. Divergence
npx tsx scripts/calculate-sp500-moving-averages.ts
npx tsx scripts/calculate-sp500-ma-divergence.ts
npx tsx scripts/calculate-sp500-ma-slope.ts
npx tsx scripts/calculate-sp500-ma-stats.ts
npx tsx scripts/calculate-ma-percentiles.ts

```



## Asset Classes Tracked

### 1. Equities (Stock Indices)
- **US Indices**: S&P 500, Dow Jones, NASDAQ Composite, NASDAQ 100, Russell 2000
- **International**: FTSE 100 (UK), DAX (Germany), Nikkei 225 (Japan), Hang Seng (Hong Kong), TSX (Canada), Merval (Argentina), BIST 100 (Turkey)

### 2. Bonds (Treasury Yields)
- 3-Month Treasury (^IRX)
- 5-Year Treasury (^FVX)
- 10-Year Treasury (^TNX)
- 30-Year Treasury (^TYX)

### 3. Commodities
- Crude Oil (CL=F)
- Gold (GC=F)
- Silver (SI=F)

### 4. Cryptocurrencies
- Bitcoin (BTC-USD)
- Ethereum (ETH-USD)

### 5. Foreign Exchange (FX)
- EUR/USD
- GBP/USD
- USD/JPY
- USD/CAD
- USD/ARS (Argentina)
- USD/TRY (Turkey)

### 6. Volatility
- VIX (^VIX)

### 7. Individual Stocks
- MAG7: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA
- Others: AVGO, NFLX

## Update Methods

### Method 1: Batch Update All (Recommended)

Updates all asset classes at once:

```bash
python scripts/batch_update_all.py
```

**What it does:**
- Fetches latest data from Yahoo Finance for all tracked assets
- Updates CSV files in respective directories
- Shows summary of successful/failed updates
- Date range: 2026-01-01 to current date (incremental)

**After running:**
```bash
npx tsx scripts/import-data-incremental.ts
```

### Method 2: Update by Asset Class

Update specific asset classes individually:

#### Equities
```bash
python scripts/update_equities.py
```
Updates: All stock indices (US and international)

#### Bonds
```bash
python scripts/update_bonds.py
```
Updates: Treasury yields (3M, 5Y, 10Y, 30Y)

#### Commodities
```bash
python scripts/update_commodities.py
```
Updates: Oil, Gold, Silver

#### Crypto
```bash
python scripts/update_crypto.py
```
Updates: Bitcoin, Ethereum

#### FX
```bash
python scripts/update_fx.py
```
Updates: All currency pairs

#### Volatility
```bash
python scripts/update_volatility.py
```
Updates: VIX

#### Stocks
```bash
python scripts/update_stocks.py
```
Updates: Individual stocks (MAG7, etc.)

## Data Import Process

After updating CSV files, import into database:

### Incremental Import (Recommended)
```bash
npx tsx scripts/import-data-incremental.ts
```
- Only imports new data points
- Faster than full import
- Safe to run multiple times
- Dates are stored as ISO strings (YYYY-MM-DD)

### Full Import (Use with caution)
```bash
npx tsx scripts/import-data.ts
```
- Imports all data from scratch
- Takes longer
- Use only if database needs rebuilding

### Import Manually Added Economic Data

If you've added a new CSV file to `data/economic/US/` (like M2SL.csv from FRED):

1. **Add the series to the import script**:
   Edit `scripts/import-new-economic-data.ts` and add your series to the `SERIES_TO_IMPORT` array:

   ```typescript
   {
       filename: 'M2SL.csv',
       seriesName: 'M2SL',
       displayName: 'M2 Money Supply',
       units: 'billions',
       convertToBillions: false  // Set to true if data is in millions
   }
   ```

2. **Ensure CSV format is correct**:
   The CSV should have headers in the first row and two columns:
   ```csv
   observation_date,M2SL
   2025-01-01,21519.7
   2025-02-01,21587.5
   ```
   
   Note: The second column name can be anything (it will be mapped to 'Value' in the database)

3. **Run the import script**:
   ```bash
   npx tsx scripts/import-new-economic-data.ts
   ```

4. **Verify the import**:
   The series will be available in the database under:
   - Asset class: `economic`
   - Series name: `M2SL` (or whatever you specified)
   - Display name: `M2 Money Supply` (or whatever you specified)

5. **Access in the UI**:
   The new series will appear in the "Economic" asset class dropdown in the data chart

## Derived Metrics & Calculations

After importing new data, you may need to recalculate derived metrics:

### Percentiles
```bash
npx tsx scripts/calculate-percentiles.ts
```
Calculates historical percentiles for all metrics.

### Rolling Averages
```bash
npx tsx scripts/calculate-rolling-averages-incremental.ts
```
Updates moving averages (50-day, 200-day, etc.)

### Year-over-Year Growth
```bash
tsx scripts/calculate-yoy-growth-incremental.ts
```
Calculates YoY percentage changes.

### Monthly Averages
```bash
tsx scripts/calculate-monthly-averages-incremental.ts
```
Aggregates daily data to monthly.

### Real Yields
```bash
tsx scripts/create-real-yields.ts
```
Calculates inflation-adjusted yields.

### Volatility Metrics (63d, 126d, 252d, 504d)
```bash
npx tsx scripts/add-volatility-metrics.ts
```
Calculates rolling volatility (annualized standard deviation) for 3-month, 6-month, 1-year, and 2-year periods. Run this after importing new price data.

## Data Directory Structure

```
data/
├── equities/
│   ├── US/
│   │   ├── GSPC.csv      # S&P 500
│   │   ├── DJI.csv       # Dow Jones
│   │   ├── IXIC.csv      # NASDAQ
│   │   └── RUT.csv       # Russell 2000
│   ├── Argentina/
│   │   └── MERV.csv
│   ├── Turkey/
│   │   └── XU100.csv
│   └── [other indices].csv
├── bonds/
│   └── US/
│       ├── IRX.csv       # 3-Month
│       ├── FVX.csv       # 5-Year
│       ├── TNX.csv       # 10-Year
│       └── TYX.csv       # 30-Year
├── commodities/
│   ├── CL=F.csv          # Oil
│   ├── GC=F.csv          # Gold
│   └── SI=F.csv          # Silver
├── crypto/
│   ├── BTCUSD.csv
│   └── ETHUSD.csv
├── fx/
│   ├── EURUSD.csv
│   ├── GBPUSD.csv
│   └── [other pairs].csv
├── volatility/
│   └── VIX.csv
├── stocks/
│   ├── AAPL.csv
│   ├── MSFT.csv
│   └── [other stocks].csv
└── macro-data.db         # SQLite database
```

## CSV File Format

All CSV files follow this format:

```csv
Date,Value
2024-01-01,4500.50
2024-01-02,4510.25
2024-01-03,4505.75
```

- **Date**: ISO format (YYYY-MM-DD)
- **Value**: Numeric value (closing price, yield, etc.)
- No headers beyond the first row
- Sorted by date (ascending)

## Troubleshooting

### No data found for ticker
- Check if Yahoo Finance ticker is correct
- Verify ticker is still active/trading
- Check date range (some data may not be available for recent dates)

### Import fails
- Ensure CSV files are properly formatted
- Check for duplicate dates
- Verify database file exists and is not corrupted

### Percentiles not updating
- Run full percentile calculation: `tsx scripts/calculate-percentiles.ts`
- Check if base data was imported successfully

### Missing derived metrics
- Run the specific calculation script for that metric
- Check dependencies (e.g., real yields need both nominal yields and CPI)

## Update Schedule Recommendations

### Daily Updates
```bash
# Morning routine (before market open)
python scripts/batch_update_all.py
tsx scripts/import-data-incremental.ts
```

### Weekly Maintenance
```bash
# Recalculate derived metrics
npx tsx scripts/calculate-rolling-averages-incremental.ts
npx tsx scripts/calculate-yoy-growth-incremental.ts
npx tsx scripts/calculate-monthly-averages-incremental.ts
```

### Monthly Maintenance
```bash
# Full recalculation of percentiles
npx tsx scripts/calculate-percentiles.ts
```

## Python Environment Setup

If you haven't set up the Python environment:

```bash
# Install Python dependencies
pip install -r scripts/requirements.txt

# Or use the setup script
bash scripts/setup_python.sh
```

### Required Python Packages
- yfinance
- pandas
- sqlite3 (built-in)

## Database Schema

The SQLite database (`data/macro-data.db`) contains:

### Tables
- `time_series_data`: Raw time series data
- `series_metadata`: Metadata about each series
- `percentile_data`: Historical percentiles
- `monthly_averages`: Monthly aggregated data
- `rolling_averages`: Moving averages
- `yoy_growth`: Year-over-year growth rates

### Key Columns
- `asset_class`: equities, bonds, commodities, crypto, fx, volatility, stocks
- `series_name`: Unique identifier (e.g., "US/GSPC", "BTCUSD")
- `date`: ISO date string
- `value`: Numeric value
- `percentile`: Historical percentile (0-100)

## Advanced Operations

### Add New Asset
1. Add ticker mapping to `scripts/batch_update_all.py` or specific update script
2. Run update script
3. Import data: `tsx scripts/import-data-incremental.ts`
4. Add metadata if needed

### Backfill Historical Data
```bash
# Modify START_DATE in update script to earlier date
# Then run update and import
python scripts/update_equities.py
tsx scripts/import-data.ts  # Use full import for backfill
```

### Export Data
```bash
# Query database directly
tsx scripts/query-db.ts

# Or export to CSV
sqlite3 data/macro-data.db ".mode csv" ".output export.csv" "SELECT * FROM time_series_data"
```

## Monitoring & Validation

### Check Data Quality
```bash
# List all series
tsx scripts/list-series.ts

# Check specific series
python scripts/list-equity-series.py

# Verify data size
python scripts/check-data-size.py
```

### Test APIs
```bash
# Test percentile API
tsx scripts/test-percentile-api.ts

# Test volatility API
tsx scripts/test-volatility-api.ts
```

## Notes

- **Incremental updates**: Scripts are configured to fetch data from 2026-01-01 onwards
- **Rate limiting**: Scripts include delays to avoid Yahoo Finance rate limits
- **Data validation**: Scripts automatically remove NaN values
- **Idempotent**: Safe to run update scripts multiple times
- **Backup**: Consider backing up `data/macro-data.db` before major updates

## Support

For issues or questions:
1. Check script output for error messages
2. Verify CSV file format
3. Check database integrity
4. Review this guide for troubleshooting steps
