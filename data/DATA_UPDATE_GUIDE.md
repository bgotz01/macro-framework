# Data Update Guide

Complete guide for updating all financial data in the macro framework application.

## Overview

This application tracks multiple asset classes with data sourced from Yahoo Finance and FRED. Data is stored in CSV files and can be imported into multiple databases:
- **SQLite** (`data/macro-data.db`) - Legacy local database
- **Postgres (macro-framework)** - Primary production database (smaller, optimized for macro data)
- **Postgres (stockdata)** - Large database with comprehensive stock data

The application has migrated from SQLite to Postgres, but supports importing to all three databases simultaneously for backwards compatibility and data redundancy.

## Quick Start - Update All Data (Incremental Only)

```bash
# ─── Two commands cover 99% of use cases ──────────────────────────────────

# 1. Fetch latest daily prices + import to all DBs:
bash scripts/update-all.sh

# 2. Recalculate monthly derived metrics + regime timeline:
bash scripts/refresh-regime.sh

# ──────────────────────────────────────────────────────────────────────────
# Note: update-all.sh already calls refresh-regime internally, so running
# both is only needed when you've manually added EPS/CPI data via the
# data-input page and want to refresh the regime without a full price fetch.
# ──────────────────────────────────────────────────────────────────────────
```

Or run each step manually:

```bash
# 1. Fetch latest data from Yahoo Finance
python scripts/batch_update_all.py

# 2. Import new data into ALL databases (SQLite + both Postgres DBs)
npx tsx scripts/import-data-multi-db.ts --all

# OR import to specific databases:
npx tsx scripts/import-data-multi-db.ts --macro-framework          # default
npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata
npx tsx scripts/import-data-multi-db.ts --all                      # all three

# 3. Calculate cyclical returns (2Y, 5Y, 10Y)
npx tsx scripts/pg/add-cyclical-returns.ts

# 4. Calculate volatility metrics (63d, 126d, 252d, 504d)
npx tsx scripts/pg/add-volatility-metrics.ts

# 5. Calculate monthly bond yields
npx tsx scripts/pg/calculate-monthly-bond-yields.ts

# 6. Calculate derived series (Real Yields, Yield Curves, EYP, REY)
npx tsx scripts/pg/calculate-derived-series.ts

# 6b. Calculate PE ratios & earnings yield (PE-5yr, PE-2yr, EYP, REY)
npx tsx scripts/pg/calculate-pe5yr.ts

# 7. Recalculate percentiles
npx tsx scripts/pg/calculate-percentiles.ts

# 7b. Calculate YoY percentile changes
npx tsx scripts/pg/calculate-yoy-percentile-change.ts

# 8. Import economic data
npx tsx scripts/pg/import-economic-data.ts

# 9. Calculate S&P 500 moving averages
npx tsx scripts/pg/calculate-sp500-moving-averages.ts

# 10. Calculate MA divergence, slope & stats
npx tsx scripts/pg/calculate-sp500-ma-divergence.ts
npx tsx scripts/pg/calculate-sp500-ma-slope.ts
npx tsx scripts/pg/calculate-sp500-ma-stats.ts

# 11. Calculate MA percentiles
npx tsx scripts/pg/calculate-ma-percentiles.ts

# 12. Rebuild regime timeline (incremental)
npx tsx scripts/pg/build-regime-timeline.ts
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

After updating CSV files, import into database(s):

### Multi-Database Import (Recommended)

Import to all three databases simultaneously:

```bash
# Import to all databases (SQLite + macro-framework + stockdata)
npx tsx scripts/import-data-multi-db.ts --all

# Import to specific databases
npx tsx scripts/import-data-multi-db.ts --macro-framework --stockdata
npx tsx scripts/import-data-multi-db.ts --sqlite --macro-framework
npx tsx scripts/import-data-multi-db.ts --macro-framework  # default
```

**Features:**
- Imports to multiple databases in a single run
- Only imports new data points (incremental)
- Faster than running separate imports
- Safe to run multiple times
- Automatic metadata synchronization

**Database Options:**
- `--all`: Import to all three databases
- `--sqlite`: Include SQLite database (data/macro-data.db)
- `--macro-framework`: Include macro-framework Postgres (default if no flags)
- `--stockdata`: Include stockdata Postgres

### Single Database Import (Legacy)

For importing to individual databases:

#### Postgres (macro-framework) - Incremental
```bash
npx tsx scripts/pg/import-data-incremental.ts
```
- Only imports new data points
- Faster than full import
- Safe to run multiple times
- Dates are stored as ISO strings (YYYY-MM-DD)

#### SQLite - Incremental (Legacy)
```bash
npx tsx scripts/import-data-incremental.ts
```
- Only imports new data points to SQLite
- Legacy support for local development

### Import Manually Added Economic Data

If you've added a new CSV file to `data/economic/US/` (like M2SL.csv from FRED):

1. **Add the series to the import script**:
   Edit `scripts/pg/import-economic-data.ts` and add your series to the `SERIES_TO_IMPORT` array:

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
   npx tsx scripts/pg/import-economic-data.ts
   ```

4. **Verify the import**:
   The series will be available in the database under:
   - Asset class: `economic`
   - Series name: `M2SL` (or whatever you specified)
   - Display name: `M2 Money Supply` (or whatever you specified)

5. **Access in the UI**:
   The new series will appear in the "Economic" asset class dropdown in the data chart

## Derived Metrics & Calculations

After importing new data, recalculate derived metrics. All scripts are in `scripts/pg/`:

### Cyclical Returns (2Y, 5Y, 10Y)
```bash
npx tsx scripts/pg/add-cyclical-returns.ts
```
Calculates rolling 2-year, 5-year, and 10-year returns for equities, commodities, crypto, and volatility.

### Volatility Metrics (63d, 126d, 252d, 504d)
```bash
npx tsx scripts/pg/add-volatility-metrics.ts
```
Calculates rolling annualized volatility for 3-month, 6-month, 1-year, and 2-year periods.

### Monthly Bond Yields
```bash
npx tsx scripts/pg/calculate-monthly-bond-yields.ts
```

### Derived Series (Real Yields, Yield Curves, EYP, REY)
```bash
npx tsx scripts/pg/calculate-derived-series.ts
npx tsx scripts/pg/calculate-pe5yr.ts
```

### Percentiles
```bash
npx tsx scripts/pg/calculate-percentiles.ts
npx tsx scripts/pg/calculate-yoy-percentile-change.ts
```
Calculates historical percentiles and YoY changes for all metrics.

### S&P 500 Moving Averages & Divergence
```bash
npx tsx scripts/pg/calculate-sp500-moving-averages.ts
npx tsx scripts/pg/calculate-sp500-ma-divergence.ts
npx tsx scripts/pg/calculate-sp500-ma-slope.ts
npx tsx scripts/pg/calculate-sp500-ma-stats.ts
npx tsx scripts/pg/calculate-ma-percentiles.ts
```

### Regime Timeline
```bash
npx tsx scripts/pg/build-regime-timeline.ts
```

### Run All Derived Metrics at Once
```bash
# Against DATABASE_URL from .env:
bash scripts/calculate-all-metrics.sh

# Against a specific database URL:
bash scripts/calculate-all-metrics.sh "postgresql://..."
```

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
# Full pipeline (recommended — runs all steps):
bash scripts/update-all.sh

# Or just fetch + import if you don't need derived metrics recalculated:
python scripts/batch_update_all.py
npx tsx scripts/import-data-multi-db.ts --all
```

### Weekly Maintenance
```bash
# Recalculate all derived metrics against the primary database:
bash scripts/calculate-all-metrics.sh
```

### Monthly Maintenance
```bash
# Full percentile recalculation:
npx tsx scripts/pg/calculate-percentiles.ts
npx tsx scripts/pg/calculate-yoy-percentile-change.ts
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

## Environment Configuration

The application requires database connection strings in your `.env` file:

```bash
# Primary database (used by Prisma by default)
DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"

# Individual database URLs for multi-db imports
MACRO_DATABASE_URL="postgresql://user:password@localhost:5432/macro-framework"
STOCKDATA_DATABASE_URL="postgresql://user:password@localhost:5432/stockdata"
SQLITE_DATABASE_PATH="./data/macro-data.db"
```

**Configuration Notes:**
- `DATABASE_URL`: Default connection used by the application
- `MACRO_DATABASE_URL`: Explicit connection for macro-framework database (falls back to DATABASE_URL if not set)
- `STOCKDATA_DATABASE_URL`: Connection for the larger stockdata database
- `SQLITE_DATABASE_PATH`: Path to SQLite database file (optional, for legacy support)

The multi-database import script will automatically detect which databases are configured and available.

## Database Schema

The application uses multiple databases:

### SQLite (`data/macro-data.db`) - Legacy
Local database for backwards compatibility and development.

**Tables:**
- `time_series_data`: Raw time series data
- `series_metadata`: Metadata about each series
- `percentile_data`: Historical percentiles
- `monthly_averages`: Monthly aggregated data
- `rolling_averages`: Moving averages
- `yoy_growth`: Year-over-year growth rates

### Postgres (macro-framework) - Primary
Optimized database for macro financial data.

**Tables:**
- `macro_time_series`: Raw time series data
- `macro_series_metadata`: Metadata about each series
- `macro_percentile_analysis`: Historical percentiles with YoY changes
- `macro_regime_timeline`: Regime classification timeline

### Postgres (stockdata) - Comprehensive
Large database with detailed stock market data, including:
- Individual stock prices and profiles
- ETF holdings and prices
- Crypto prices and divergence metrics
- Market breadth indicators
- Insider activity
- And more...

The macro data tables (`macro_time_series`, `macro_series_metadata`, etc.) exist in both Postgres databases and can be kept in sync using the multi-database import script.

### Key Columns (Common Across Databases)
- `asset_class`: equities, bonds, commodities, crypto, fx, volatility, stocks
- `series_name`: Unique identifier (e.g., "US/GSPC", "BTCUSD")
- `date`: ISO date string (YYYY-MM-DD)
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

- **Incremental updates**: The batch fetch script is configured to pull from a recent start date. Adjust `START_DATE` in `scripts/batch_update_all.py` if you need to backfill further.
- **Rate limiting**: Scripts include delays to avoid Yahoo Finance rate limits
- **Data validation**: Scripts automatically remove NaN values
- **Idempotent**: Safe to run update scripts multiple times
- **Manually maintained data**: Some series (IPO data, international inflation/M2) cannot be auto-downloaded and must be updated manually in their CSV files before re-importing

## Support

For issues or questions:
1. Check script output for error messages
2. Verify CSV file format
3. Check database integrity
4. Review this guide for troubleshooting steps
