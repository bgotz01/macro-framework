# Fetching Data from Yahoo Finance

## Setup

### Option 1: Quick Setup (Recommended)

Run the setup script:

```bash
bash scripts/setup_python.sh
```

This will:
- Create a Python virtual environment
- Install all dependencies
- Show you how to activate it

### Option 2: Manual Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r scripts/requirements.txt
```

## Usage

1. **Activate the virtual environment:**

```bash
source venv/bin/activate
```

2. **Edit `scripts/fetch_yfinance.py`** and configure:
   - `TICKER` - The Yahoo Finance ticker symbol
   - `ASSET_CLASS` - Asset category (equities, bonds, fx, commodities, etc.)
   - `COUNTRY` - Country code (US, UK, Germany, etc.)
   - `START_DATE` / `END_DATE` - Date range
   - `VALUE_COLUMN` - Which price to use (Close, Open, etc.)

   The output filename is automatically generated from the ticker.

3. Run the script:

```bash
python scripts/fetch_yfinance.py
```

4. **(Optional) Add friendly display name** by editing `data/series-metadata.json`:

```json
{
  "equities": {
    "US/IXIC": {
      "displayName": "NASDAQ Composite",
      "description": "NASDAQ Composite Index"
    }
  }
}
```

5. Import into database:

```bash
pnpm import-data
```

## Examples

### Fetch NASDAQ Composite (1960-present)

```python
TICKER = "^IXIC"
ASSET_CLASS = "equities"
COUNTRY = "US"
START_DATE = "1960-01-01"
VALUE_COLUMN = "Close"
```

Output: `data/equities/US/IXIC.csv`

### Fetch 10-Year Treasury Yield

```python
TICKER = "^TNX"
ASSET_CLASS = "bonds"
COUNTRY = "US"
START_DATE = "1990-01-01"
VALUE_COLUMN = "Close"
```

Output: `data/bonds/US/TNX.csv`

### Fetch Bitcoin

```python
TICKER = "BTC-USD"
ASSET_CLASS = "crypto"
COUNTRY = "US"
START_DATE = "2014-01-01"
VALUE_COLUMN = "Close"
```

Output: `data/crypto/US/BTC.csv`

### Fetch EUR/USD

```python
TICKER = "EURUSD=X"
ASSET_CLASS = "fx"
COUNTRY = "Global"
START_DATE = "2000-01-01"
VALUE_COLUMN = "Close"
```

Output: `data/fx/Global/EURUSD.csv`

## Common Tickers

### US Equities
- `^GSPC` - S&P 500
- `^DJI` - Dow Jones Industrial Average
- `^IXIC` - NASDAQ Composite
- `^RUT` - Russell 2000

### International Equities
- `^FTSE` - FTSE 100 (UK)
- `^GDAXI` - DAX (Germany)
- `^N225` - Nikkei 225 (Japan)
- `^HSI` - Hang Seng (Hong Kong)

### Bonds/Rates
- `^TNX` - 10-Year Treasury Yield
- `^FVX` - 5-Year Treasury Yield
- `^TYX` - 30-Year Treasury Yield
- `^IRX` - 13-Week Treasury Bill

### Commodities
- `GC=F` - Gold Futures
- `CL=F` - Crude Oil Futures
- `SI=F` - Silver Futures
- `NG=F` - Natural Gas Futures

### Currencies
- `EURUSD=X` - Euro/USD
- `GBPUSD=X` - British Pound/USD
- `USDJPY=X` - USD/Japanese Yen
- `AUDUSD=X` - Australian Dollar/USD

### Crypto
- `BTC-USD` - Bitcoin
- `ETH-USD` - Ethereum

## Notes

- Yahoo Finance data is free but may have limitations
- Historical data availability varies by ticker
- Some tickers may have gaps or missing data
- Treasury yields (^TNX, etc.) are in percentage points
- The script automatically creates directories if they don't exist
- Output format is always `Date,Value` for compatibility
