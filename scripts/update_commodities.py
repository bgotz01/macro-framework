#!/usr/bin/env python3
"""
Update commodity data from Yahoo Finance.

Usage:
    python scripts/update_commodities.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import time

# Configuration - for incremental updates only
START_DATE = "2026-01-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

# Commodity tickers and their mappings
COMMODITY_TICKERS = {
    "CL=F": {
        "yahoo": "CL=F",
        "name": "Crude Oil Futures",
        "path": "data/commodities/CL=F.csv"
    },
    "GC=F": {
        "yahoo": "GC=F",
        "name": "Gold Futures",
        "path": "data/commodities/GC=F.csv"
    },
    "SI=F": {
        "yahoo": "SI=F",
        "name": "Silver Futures",
        "path": "data/commodities/SI=F.csv"
    },
    "HG=F": {
        "yahoo": "HG=F",
        "name": "Copper Futures",
        "path": "data/commodities/HG=F.csv"
    },
    "NG=F": {
        "yahoo": "NG=F",
        "name": "Natural Gas Futures",
        "path": "data/commodities/NG=F.csv"
    },
    "RB=F": {
        "yahoo": "RB=F",
        "name": "Gasoline RBOB Futures",
        "path": "data/commodities/RB=F.csv"
    },
    "HO=F": {
        "yahoo": "HO=F",
        "name": "Heating Oil Futures",
        "path": "data/commodities/HO=F.csv"
    },
    "ZC=F": {
        "yahoo": "ZC=F",
        "name": "Corn Futures",
        "path": "data/commodities/ZC=F.csv"
    },
    "ZW=F": {
        "yahoo": "ZW=F",
        "name": "Wheat Futures",
        "path": "data/commodities/ZW=F.csv"
    },
    "ZS=F": {
        "yahoo": "ZS=F",
        "name": "Soybean Futures",
        "path": "data/commodities/ZS=F.csv"
    },
}

def fetch_commodity_data(ticker_info: dict, ticker_key: str) -> bool:
    """Fetch commodity data and save to CSV."""
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
    """Update all commodity data."""
    print("🛢️ Updating Commodity Data")
    print("=" * 50)
    
    successful = 0
    failed = 0
    
    for i, (ticker_key, ticker_info) in enumerate(COMMODITY_TICKERS.items(), 1):
        print(f"\n[{i}/{len(COMMODITY_TICKERS)}] Processing {ticker_key}...")
        
        if fetch_commodity_data(ticker_info, ticker_key):
            successful += 1
        else:
            failed += 1
        
        # Small delay to avoid rate limiting
        if i < len(COMMODITY_TICKERS):
            time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 COMMODITIES UPDATE SUMMARY")
    print("=" * 50)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(COMMODITY_TICKERS)}")
    
    if successful > 0:
        print(f"\n✅ Updated {successful} commodity series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.")

if __name__ == "__main__":
    main()