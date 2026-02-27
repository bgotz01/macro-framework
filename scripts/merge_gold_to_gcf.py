#!/usr/bin/env python3
"""
Merge historical gold price data (1975-2009) from GOLD.csv into GC=F series.
This fills in the historical gap before GC=F data starts in 2000.
"""

import sqlite3
import csv
from datetime import datetime
import sys
from pathlib import Path

# Configuration
CSV_FILE = "data/commodities/GOLD.csv"
DB_FILE = "data/macro-data.db"
ASSET_CLASS = "commodities"
SERIES_NAME = "GC=F"

def date_to_unix_ms(date_str):
    """Convert date string (YYYY-MM-DD) to Unix timestamp in milliseconds."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return int(dt.timestamp() * 1000)

def merge_gold_data():
    """Merge gold close price data from CSV into GC=F series as 'Value' column."""
    
    # Check if CSV file exists
    if not Path(CSV_FILE).exists():
        print(f"Error: CSV file not found: {CSV_FILE}")
        sys.exit(1)
    
    # Connect to database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Read CSV file
        with open(CSV_FILE, 'r') as f:
            reader = csv.DictReader(f)
            
            records_inserted = 0
            records_updated = 0
            records_skipped = 0
            
            for row in reader:
                date_str = row['Date']
                value_str = row['Value'].strip()
                
                # Skip empty values
                if not value_str:
                    records_skipped += 1
                    continue
                
                try:
                    close_value = float(value_str)
                except ValueError:
                    print(f"Warning: Invalid value '{value_str}' for Value on {date_str}")
                    records_skipped += 1
                    continue
                
                unix_ms = date_to_unix_ms(date_str)
                
                # Insert Close as 'Value' column (standard column name for price series)
                cursor.execute("""
                    INSERT INTO time_series (date, asset_class, series_name, column_name, value)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(date, asset_class, series_name, column_name) 
                    DO UPDATE SET value = excluded.value
                """, (unix_ms, ASSET_CLASS, SERIES_NAME, 'Value', close_value))
                
                if cursor.rowcount == 1:
                    records_inserted += 1
                else:
                    records_updated += 1
        
        # Update metadata
        cursor.execute("""
            UPDATE series_metadata 
            SET 
                display_name = 'Gold Futures (GC=F)',
                description = 'Gold futures prices with historical data from 1975',
                last_updated = ?,
                units = 'USD per troy ounce',
                currency = 'USD'
            WHERE asset_class = ? AND series_name = ?
        """, (
            int(datetime.now().timestamp() * 1000),
            ASSET_CLASS,
            SERIES_NAME
        ))
        
        # Commit changes
        conn.commit()
        
        print(f"✓ Merge completed successfully!")
        print(f"  Records inserted: {records_inserted}")
        print(f"  Records updated: {records_updated}")
        print(f"  Records skipped: {records_skipped}")
        
        # Show date range
        cursor.execute("""
            SELECT MIN(date), MAX(date), COUNT(DISTINCT date)
            FROM time_series
            WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
        """, (ASSET_CLASS, SERIES_NAME))
        
        min_date, max_date, count = cursor.fetchone()
        if min_date and max_date:
            min_dt = datetime.fromtimestamp(min_date / 1000)
            max_dt = datetime.fromtimestamp(max_date / 1000)
            print(f"  Date range: {min_dt.strftime('%Y-%m-%d')} to {max_dt.strftime('%Y-%m-%d')}")
            print(f"  Total dates: {count}")
        
        # Show available columns
        cursor.execute("""
            SELECT DISTINCT column_name
            FROM time_series
            WHERE asset_class = ? AND series_name = ?
            ORDER BY column_name
        """, (ASSET_CLASS, SERIES_NAME))
        
        columns = [row[0] for row in cursor.fetchall()]
        print(f"  Available columns: {', '.join(columns)}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error during merge: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        conn.close()

if __name__ == "__main__":
    print(f"Merging historical gold data (1975-2009) from {CSV_FILE} into GC=F series...")
    merge_gold_data()
