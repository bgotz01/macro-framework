#!/usr/bin/env python3
"""
Update equity index data from Yahoo Finance.

Usage:
    python scripts/update_equities.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import time

# Configuration - for incremental updates only
START_DATE = "2026-02-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

# Equity index tickers and their mappings
EQUITY_TICKERS = {
    # US Indices
    "GSPC": {
        "yahoo": "^GSPC",
        "name": "S&P 500",
        "path": "data/equities/US/GSPC.csv"
    },
    "DJI": {
        "yahoo": "^DJI",
        "name": "Dow Jones Industrial Average",
        "path": "data/equities/US/DJI.csv"
    },
    "IXIC": {
        "yahoo": "^IXIC",
        "name": "NASDAQ Composite",
        "path": "data/equities/US/IXIC.csv"
    },
    "NDX": {
        "yahoo": "^NDX",
        "name": "NASDAQ 100",
        "path": "data/equities/NDX.csv"
    },
    "RUT": {
        "yahoo": "^RUT",
        "name": "Russell 2000",
        "path": "data/equities/US/RUT.csv"
    },
    
    # International Indices
    "FTSE": {
        "yahoo": "^FTSE",
        "name": "FTSE 100 (UK)",
        "path": "data/equities/FTSE.csv"
    },
    "GDAXI": {
        "yahoo": "^GDAXI",
        "name": "DAX (Germany)",
        "path": "data/equities/GDAXI.csv"
    },
    "N225": {
        "yahoo": "^N225",
        "name": "Nikkei 225 (Japan)",
        "path": "data/equities/N225.csv"
    },
    "HSI": {
        "yahoo": "^HSI",
        "name": "Hang Seng (Hong Kong)",
        "path": "data/equities/HSI.csv"
    },
    "GSPTSE": {
        "yahoo": "^GSPTSE",
        "name": "S&P/TSX Composite (Canada)",
        "path": "data/equities/GSPTSE.csv"
    },
    "MERV": {
        "yahoo": "^MERV",
        "name": "S&P Merval (Argentina)",
        "path": "data/equities/Argentina/MERV.csv"
    },
    "XU100": {
        "yahoo": "XU100.IS",
        "name": "BIST 100 (Turkey)",
        "path": "data/equities/Turkey/XU100.csv"
    }
}

def fetch_equity_data(ticker_info: dict, ticker_key: str) -> bool:
    """Fetch equity data and save to CSV."""
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
    """Update all equity index data."""
    print("📈 Updating Equity Index Data")
    print("=" * 50)
    
    successful = 0
    failed = 0
    
    for i, (ticker_key, ticker_info) in enumerate(EQUITY_TICKERS.items(), 1):
        print(f"\n[{i}/{len(EQUITY_TICKERS)}] Processing {ticker_key}...")
        
        if fetch_equity_data(ticker_info, ticker_key):
            successful += 1
        else:
            failed += 1
        
        # Small delay to avoid rate limiting
        if i < len(EQUITY_TICKERS):
            time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 EQUITIES UPDATE SUMMARY")
    print("=" * 50)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(EQUITY_TICKERS)}")
    
    if successful > 0:
        print(f"\n✅ Updated {successful} equity series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.")

if __name__ == "__main__":
    main()