#!/usr/bin/env python3
"""
Batch update all financial data from Yahoo Finance and save to CSV format.
This script updates all assets tracked in our SQLite database with new data from 2026 onwards.

Usage:
    python scripts/batch_update_all.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import sqlite3
from typing import Dict, List, Tuple
import time

# Database path
DB_PATH = "data/macro-data.db"

# Date range - for incremental updates only
START_DATE = "2026-01-01"
END_DATE = datetime.now().strftime("%Y-%m-%d")

# Yahoo Finance ticker mappings
TICKER_MAPPINGS = {
    # Bonds/Rates
    "US/IRX": "^IRX",           # 3-Month Treasury
    "US/FVX": "^FVX",           # 5-Year Treasury
    "US/TNX": "^TNX",           # 10-Year Treasury
    "US/TYX": "^TYX",           # 30-Year Treasury
    "US/US-2yr": "^TNX",        # 2-Year Treasury (approximation)
    "US/FEDFUNDS": "^IRX",      # Fed Funds (approximation)
    
    # Commodities
    "CL=F": "CL=F",             # Crude Oil
    "GC=F": "GC=F",             # Gold
    "SI=F": "SI=F",             # Silver
    
    # Crypto
    "BTCUSD": "BTC-USD",        # Bitcoin
    "ETHUSD": "ETH-USD",        # Ethereum
    
    # US Equities
    "US/GSPC": "^GSPC",         # S&P 500
    "US/DJI": "^DJI",           # Dow Jones
    "US/IXIC": "^IXIC",         # NASDAQ Composite
    "US/RUT": "^RUT",           # Russell 2000
    "DJI": "^DJI",              # Dow Jones (Historical)
    "NDX": "^NDX",              # NASDAQ 100
    
    # International Equities
    "FTSE": "^FTSE",            # FTSE 100
    "GDAXI": "^GDAXI",          # DAX
    "N225": "^N225",            # Nikkei 225
    "HSI": "^HSI",              # Hang Seng
    "GSPTSE": "^GSPTSE",        # S&P/TSX Composite
    "Argentina/MERV": "^MERV",  # Argentina
    "Turkey/XU100.IS": "XU100.IS", # BIST 100
    
    # FX
    "EURUSD": "EURUSD=X",       # EUR/USD
    "GBPUSD": "GBPUSD=X",       # GBP/USD
    "USDJPY": "USDJPY=X",       # USD/JPY
    "USDCAD": "USDCAD=X",       # USD/CAD
    "USDARS": "USDARS=X",       # USD/ARS
    "USDTRY": "USDTRY=X",       # USD/TRY
    
    # Individual Stocks
    "AAPL": "AAPL",             # Apple
    "MSFT": "MSFT",             # Microsoft
    "GOOGL": "GOOGL",           # Alphabet
    "AMZN": "AMZN",             # Amazon
    "NVDA": "NVDA",             # NVIDIA
    "META": "META",             # Meta
    "TSLA": "TSLA",             # Tesla
    "AVGO": "AVGO",             # Broadcom
    "NFLX": "NFLX",             # Netflix
    
    # Volatility
    "VIX": "^VIX",              # VIX
}

def get_series_from_db() -> List[Tuple[str, str, str]]:
    """Get all series from the database that have Yahoo Finance mappings."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT asset_class, series_name, display_name 
        FROM series_metadata 
        ORDER BY asset_class, series_name
    """)
    
    series = cursor.fetchall()
    conn.close()
    
    # Filter only series that have Yahoo Finance mappings
    mapped_series = []
    for asset_class, series_name, display_name in series:
        if series_name in TICKER_MAPPINGS:
            mapped_series.append((asset_class, series_name, display_name))
    
    return mapped_series

def fetch_data_for_series(series_name: str, display_name: str, asset_class: str) -> bool:
    """Fetch data for a single series and save to CSV."""
    
    if series_name not in TICKER_MAPPINGS:
        print(f"❌ No Yahoo Finance mapping for {series_name}")
        return False
    
    yahoo_ticker = TICKER_MAPPINGS[series_name]
    
    # Determine output path based on asset class
    if asset_class == "bonds":
        country = "US" if series_name.startswith("US/") else ""
        output_file = f"data/bonds/{country}/{series_name.replace('US/', '').replace('/', '_')}.csv"
    elif asset_class == "commodities":
        output_file = f"data/commodities/{series_name}.csv"
    elif asset_class == "crypto":
        output_file = f"data/crypto/{series_name}.csv"
    elif asset_class == "equities":
        if "/" in series_name:
            country, ticker = series_name.split("/", 1)
            output_file = f"data/equities/{country}/{ticker}.csv"
        else:
            output_file = f"data/equities/{series_name}.csv"
    elif asset_class == "fx":
        output_file = f"data/fx/{series_name}.csv"
    elif asset_class == "stocks":
        output_file = f"data/stocks/{series_name}.csv"
    elif asset_class == "volatility":
        output_file = f"data/volatility/{series_name}.csv"
    else:
        output_file = f"data/{asset_class}/{series_name}.csv"
    
    print(f"📊 Fetching {display_name} ({yahoo_ticker})...")
    
    try:
        # Download data
        ticker = yf.Ticker(yahoo_ticker)
        df = ticker.history(start=START_DATE, end=END_DATE)
        
        if df.empty:
            print(f"❌ No data found for {yahoo_ticker}")
            return False
        
        print(f"✓ Downloaded {len(df)} data points")
        
        # Create output dataframe with Date and Value columns
        output_df = pd.DataFrame({
            'Date': df.index.strftime('%Y-%m-%d'),
            'Value': df['Close']
        })
        
        # Remove rows with NaN values
        output_df = output_df.dropna()
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            print(f"✓ Created directory: {output_dir}")
        
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
    """Main function to batch update all series."""
    print("🚀 Starting batch update of all financial data...")
    print(f"📅 Date range: {START_DATE} to {END_DATE}")
    print("=" * 60)
    
    # Get all series from database
    series_list = get_series_from_db()
    
    print(f"📋 Found {len(series_list)} series with Yahoo Finance mappings:")
    for asset_class, series_name, display_name in series_list:
        yahoo_ticker = TICKER_MAPPINGS.get(series_name, "N/A")
        print(f"   {asset_class:12} | {series_name:20} | {yahoo_ticker:12} | {display_name}")
    
    print("\n" + "=" * 60)
    
    # Process each series
    successful = 0
    failed = 0
    
    for i, (asset_class, series_name, display_name) in enumerate(series_list, 1):
        print(f"\n[{i}/{len(series_list)}] Processing {asset_class}/{series_name}...")
        
        if fetch_data_for_series(series_name, display_name, asset_class):
            successful += 1
        else:
            failed += 1
        
        # Add small delay to avoid rate limiting
        if i < len(series_list):
            time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("📊 BATCH UPDATE SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(series_list)}")
    print(f"📊 Success Rate: {successful/len(series_list)*100:.1f}%")
    
    if successful > 0:
        print(f"\n✅ Updated {successful} series. Run 'tsx scripts/import-data-incremental.ts' to import new data into database.")
    
    print("\n🎉 Batch update completed!")

if __name__ == "__main__":
    main()