#!/usr/bin/env python3
"""
Update foreign exchange data from Yahoo Finance.

Usage:
    python scripts/update_fx.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import time

# Configuration - for incremental updates only
START_DATE = "2026-02-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

# FX tickers and their mappings
FX_TICKERS = {
    "EURUSD": {
        "yahoo": "EURUSD=X",
        "name": "EUR/USD Exchange Rate",
        "path": "data/fx/EURUSD.csv"
    },
    "GBPUSD": {
        "yahoo": "GBPUSD=X",
        "name": "GBP/USD Exchange Rate",
        "path": "data/fx/GBPUSD.csv"
    },
    "USDJPY": {
        "yahoo": "USDJPY=X",
        "name": "USD/JPY Exchange Rate",
        "path": "data/fx/USDJPY.csv"
    },
    "USDCAD": {
        "yahoo": "USDCAD=X",
        "name": "USD/CAD Exchange Rate",
        "path": "data/fx/USDCAD.csv"
    },
    "USDARS": {
        "yahoo": "USDARS=X",
        "name": "USD/ARS Exchange Rate",
        "path": "data/fx/USDARS.csv"
    },
    "USDTRY": {
        "yahoo": "USDTRY=X",
        "name": "USD/TRY Exchange Rate",
        "path": "data/fx/USDTRY.csv"
    }
}

def fetch_fx_data(ticker_info: dict, ticker_key: str) -> bool:
    """Fetch FX data and save to CSV."""
    yahoo_ticker = ticker_info["yahoo"]
    name = ticker_info["name"]
    output_file = ticker_info["path"]
    
    print(f"📊 Fetching {name} ({yahoo_ticker})...")
    
    try:
        # Download data
        ticker = yf.Ticker(yahoo_ticker)
        df = ticker.history(start=START_DATE, end=END_DATE)
        
        if df.empty:
            print(f"❌ No data found for {yahoo_ticker}")
            return False
        
        print(f"✓ Downloaded {len(df)} data points")
        
        # Create output dataframe
        output_df = pd.DataFrame({
            'Date': df.index.strftime('%Y-%m-%d'),
            'Value': df['Close']
        })
        
        # Remove NaN values
        output_df = output_df.dropna()
        
        # Create directory if needed
        output_dir = os.path.dirname(output_file)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        
        # Save to CSV
        output_df.to_csv(output_file, index=False)
        print(f"✓ Saved to: {output_file}")
        print(f"✓ Data points: {len(output_df)}")
        print(f"✓ Date range: {output_df['Date'].iloc[0]} to {output_df['Date'].iloc[-1]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fetching {yahoo_ticker}: {e}")
        return False

def main():
    """Update all FX data."""
    print("💱 Updating Foreign Exchange Data")
    print("=" * 50)
    
    successful = 0
    failed = 0
    
    for i, (ticker_key, ticker_info) in enumerate(FX_TICKERS.items(), 1):
        print(f"\n[{i}/{len(FX_TICKERS)}] Processing {ticker_key}...")
        
        if fetch_fx_data(ticker_info, ticker_key):
            successful += 1
        else:
            failed += 1
        
        # Small delay to avoid rate limiting
        if i < len(FX_TICKERS):
            time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 FX UPDATE SUMMARY")
    print("=" * 50)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(FX_TICKERS)}")
    
    if successful > 0:
        print(f"\n✅ Updated {successful} FX series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.")

if __name__ == "__main__":
    main()