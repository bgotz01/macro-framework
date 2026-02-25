# Financial Data Update Scripts

This directory contains Python scripts to batch update financial data from Yahoo Finance for all assets tracked in our SQLite database.

## Overview

The scripts fetch data from Yahoo Finance and save it in CSV format compatible with our data import system. After running the scripts, use `pnpm import-data` to import the updated data into the SQLite database.

## Scripts Available

### 🚀 Batch Update All Assets
```bash
python scripts/batch_update_all.py
```
Updates all assets across all categories in one go. This is the most comprehensive option.

### 📊 Individual Asset Class Updates

#### 🏛️ Bonds/Treasury Yields
```bash
python scripts/update_bonds.py
```
Updates: 3M, 5Y, 10Y, 30Y Treasury yields

#### 📈 Equity Indices  
```bash
python scripts/update_equities.py
```
Updates: S&P 500, Dow Jones, NASDAQ, Russell 2000, FTSE 100, DAX, Nikkei 225, Hang Seng, etc.

#### 🛢️ Commodities
```bash
python scripts/update_commodities.py
```
Updates: Crude Oil, Gold, Silver futures

#### 💱 Foreign Exchange
```bash
python scripts/update_fx.py
```
Updates: EUR/USD, GBP/USD, USD/JPY, USD/CAD, USD/ARS, USD/TRY

#### 🏢 Individual Stocks
```bash
python scripts/update_stocks.py
```
Updates: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, AVGO, NFLX

#### ₿ Cryptocurrency
```bash
python scripts/update_crypto.py
```
Updates: Bitcoin, Ethereum

#### 📊 Volatility
```bash
python scripts/update_volatility.py
```
Updates: VIX (CBOE Volatility Index)

## Usage Workflow

1. **Choose your update method:**
   - For all assets: `python scripts/batch_update_all.py`
   - For specific asset class: `python scripts/update_[category].py`

2. **Import updated data into database (incremental - new dates only):**
   ```bash
   tsx scripts/import-data-incremental.ts
   ```
   
   Or for full reimport (overwrites existing data):
   ```bash
   pnpm import-data
   ```

3. **Verify the update:**
   Check the database or your application to confirm new data was imported.

## Features

- ✅ **Incremental updates only** - Fetches data from Jan 1, 2026 onwards
- ✅ **Smart import** - New incremental import script only adds new dates
- ✅ **Automatic directory creation** - Creates necessary folder structure
- ✅ **Data validation** - Removes NaN values and validates data
- ✅ **Rate limiting** - Small delays between requests to avoid API limits
- ✅ **Progress tracking** - Shows detailed progress and success/failure counts
- ✅ **Error handling** - Continues processing even if individual tickers fail
- ✅ **Flexible date ranges** - Configurable start/end dates per asset class
- ✅ **CSV compatibility** - Outputs in format expected by import system

## Data Coverage

The scripts cover all major asset classes tracked in our database:

| Asset Class | Count | Examples |
|-------------|-------|----------|
| Bonds | 4 | 3M, 5Y, 10Y, 30Y Treasury yields |
| Equities | 12 | S&P 500, NASDAQ, international indices |
| Commodities | 3 | Oil, Gold, Silver |
| FX | 6 | Major currency pairs |
| Stocks | 9 | Large cap tech stocks |
| Crypto | 2 | Bitcoin, Ethereum |
| Volatility | 1 | VIX |

## Configuration

Each script has configurable parameters at the top:

- `START_DATE`: Set to "2026-01-01" for incremental updates only
- `END_DATE`: Data end date (defaults to today)
- Ticker mappings for Yahoo Finance symbols

## Import Scripts

- **Incremental Import**: `tsx scripts/import-data-incremental.ts` - Only adds new dates, preserves existing data
- **Full Import**: `pnpm import-data` - Overwrites existing data (use for initial setup or data corrections)

## Requirements

- Python 3.7+
- yfinance library: `pip install yfinance`
- pandas library: `pip install pandas`

## Notes

- **Rate Limiting**: Scripts include small delays between requests to respect Yahoo Finance API limits
- **Data Quality**: All scripts validate data and remove NaN values
- **Error Recovery**: If one ticker fails, the script continues with remaining tickers
- **Incremental Updates**: Running scripts multiple times will overwrite existing CSV files with latest data
- **Incremental Updates**: All scripts now fetch data from Jan 1, 2026 onwards only
- **Import Required**: After running update scripts, use `tsx scripts/import-data-incremental.ts` for incremental updates or `pnpm import-data` for full reimport

## Troubleshooting

**Common Issues:**

1. **No data found for ticker**: Some tickers may not be available on Yahoo Finance or may have different symbols
2. **Rate limiting**: If you get rate limited, increase the delay between requests in the scripts
3. **Network issues**: Temporary network problems may cause individual ticker failures - just re-run the script

**Getting Help:**

Check the console output for detailed error messages and success/failure counts. Each script provides comprehensive logging of what it's doing.