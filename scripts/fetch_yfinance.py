#!/usr/bin/env python3
"""
Fetch financial data from Yahoo Finance and save to CSV format compatible with the data structure.

Usage:
    python scripts/fetch_yfinance.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os

# ============================================================================
# CONFIGURATION - Edit these values
# ============================================================================

# Ticker symbol (e.g., '^GSPC' for S&P 500, 'AAPL' for Apple, '^TNX' for 10-year Treasury)
TICKER = "2YY=F"

# Asset class and country for organizing the output
# This determines the folder structure: data/{ASSET_CLASS}/{COUNTRY}/
ASSET_CLASS = "bonds"  # e.g., equities, bonds, fx, commodities
COUNTRY = ""            # e.g., US, UK, Germany, Japan

# Date range
START_DATE = "1960-01-01"  # YYYY-MM-DD format
END_DATE = datetime.now().strftime("%Y-%m-%d")  # Today

# Which column to use as Value (options: 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume')
VALUE_COLUMN = "Close"

# ============================================================================
# Common Tickers Reference
# ============================================================================
# 
# US Equities:
#   ^GSPC    - S&P 500
#   ^DJI     - Dow Jones Industrial Average
#   ^IXIC    - NASDAQ Composite
#   ^NDX     - Nasdaq 100
#   ^RUT     - Russell 2000
#
# International Equities:
#   ^FTSE    - FTSE 100 (UK)
#   ^GDAXI   - DAX (Germany)
#   ^N225    - Nikkei 225 (Japan)
#   ^HSI     - Hang Seng (Hong Kong)
#   ^MERV   - Argentina
#   XU100.IS - Turkey
#   ^GSPTSE - Canada
#
# Bonds/Rates:
#   ^IRX     - 3-Month Treasury Yield
#   ^TNX     - 10-Year Treasury Yield
#   ^FVX     - 5-Year Treasury Yield
#   ^TYX     - 30-Year Treasury Yield
#   2YY=F   - 2-Year Treasury Yield


#
# Commodities:
#   GC=F     - Gold Futures
#   CL=F     - Crude Oil Futures
#   SI=F     - Silver Futures
#
# Currencies:
#   EURUSD=X - Euro/USD
#   GBPUSD=X - British Pound/USD
#   USDJPY=X - USD/Japanese Yen
#   USDCAD=X - Canadian Dollar
#   USDARS=X - Argentine Peso
#   USDTRY=X - Turkish Lira
#
# Crypto:
#   BTC-USD  - Bitcoin
#   ETH-USD  - Ethereum
#
# ============================================================================

def fetch_data():
    """Fetch data from Yahoo Finance and save to CSV."""
    
    # Auto-generate output filename from ticker
    # Remove ^ prefix and convert to uppercase
    clean_ticker = TICKER.replace("^", "").replace("=X", "").replace("-USD", "").upper()
    OUTPUT_FILE = f"data/{ASSET_CLASS}/{COUNTRY}/{clean_ticker}.csv"
    
    print(f"📊 Fetching {TICKER} from Yahoo Finance...")
    print(f"   Date range: {START_DATE} to {END_DATE}")
    print(f"   Using column: {VALUE_COLUMN}")
    print(f"   Output: {OUTPUT_FILE}")
    
    try:
        # Download data
        ticker = yf.Ticker(TICKER)
        df = ticker.history(start=START_DATE, end=END_DATE)
        
        if df.empty:
            print(f"❌ No data found for {TICKER}")
            return
        
        print(f"✓ Downloaded {len(df)} data points")
        
        # Check if the value column exists
        if VALUE_COLUMN not in df.columns:
            print(f"❌ Column '{VALUE_COLUMN}' not found. Available columns: {list(df.columns)}")
            return
        
        # Create output dataframe with Date and Value columns
        output_df = pd.DataFrame({
            'Date': df.index.strftime('%Y-%m-%d'),
            'Value': df[VALUE_COLUMN]
        })
        
        # Remove rows with NaN values
        output_df = output_df.dropna()
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(OUTPUT_FILE)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            print(f"✓ Created directory: {output_dir}")
        
        # Save to CSV
        output_df.to_csv(OUTPUT_FILE, index=False)
        print(f"✓ Saved to: {OUTPUT_FILE}")
        print(f"✓ Data points: {len(output_df)}")
        print(f"✓ Date range: {output_df['Date'].iloc[0]} to {output_df['Date'].iloc[-1]}")
        
        # Show sample data
        print("\nSample data (first 5 rows):")
        print(output_df.head().to_string(index=False))
        
        print("\n✅ Done! Run 'pnpm import-data' to import into database.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fetch_data()
