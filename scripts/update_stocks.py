#!/usr/bin/env python3
"""
Update individual stock data from Yahoo Finance.

Usage:
    python scripts/update_stocks.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import time

# Configuration - for incremental updates only
START_DATE = "2026-01-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

# Individual stock tickers
STOCK_TICKERS = {
    "AAPL": {
        "yahoo": "AAPL",
        "name": "Apple Inc.",
        "path": "data/stocks/AAPL.csv"
    },
    "MSFT": {
        "yahoo": "MSFT",
        "name": "Microsoft Corporation",
        "path": "data/stocks/MSFT.csv"
    },
    "GOOGL": {
        "yahoo": "GOOGL",
        "name": "Alphabet Inc. (Google)",
        "path": "data/stocks/GOOGL.csv"
    },
    "AMZN": {
        "yahoo": "AMZN",
        "name": "Amazon.com Inc.",
        "path": "data/stocks/AMZN.csv"
    },
    "NVDA": {
        "yahoo": "NVDA",
        "name": "NVIDIA Corporation",
        "path": "data/stocks/NVDA.csv"
    },
    "META": {
        "yahoo": "META",
        "name": "Meta Platforms Inc.",
        "path": "data/stocks/META.csv"
    },
    "TSLA": {
        "yahoo": "TSLA",
        "name": "Tesla Inc.",
        "path": "data/stocks/TSLA.csv"
    },
    "AVGO": {
        "yahoo": "AVGO",
        "name": "Broadcom Inc.",
        "path": "data/stocks/AVGO.csv"
    },
    "NFLX": {
        "yahoo": "NFLX",
        "name": "Netflix Inc.",
        "path": "data/stocks/NFLX.csv"
    }
}

def fetch_stock_data(ticker_info: dict, ticker_key: str) -> bool:
    """Fetch stock data and save to CSV."""
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
    """Update all individual stock data."""
    print("🏢 Updating Individual Stock Data")
    print("=" * 50)
    
    successful = 0
    failed = 0
    
    for i, (ticker_key, ticker_info) in enumerate(STOCK_TICKERS.items(), 1):
        print(f"\n[{i}/{len(STOCK_TICKERS)}] Processing {ticker_key}...")
        
        if fetch_stock_data(ticker_info, ticker_key):
            successful += 1
        else:
            failed += 1
        
        # Small delay to avoid rate limiting
        if i < len(STOCK_TICKERS):
            time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 STOCKS UPDATE SUMMARY")
    print("=" * 50)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(STOCK_TICKERS)}")
    
    if successful > 0:
        print(f"\n✅ Updated {successful} stock series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.")

if __name__ == "__main__":
    main()