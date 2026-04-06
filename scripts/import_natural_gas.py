#!/usr/bin/env python3
"""
Download Natural Gas futures (NG=F) from Yahoo Finance and import into macro-data.db.
"""

import sqlite3
import yfinance as yf

DB_FILE = "data/macro-data.db"
ASSET_CLASS = "commodities"
SERIES_NAME = "NG=F"
DISPLAY_NAME = "Natural Gas"
UNITS = "usd_per_mmbtu"

def main():
    print(f"📥 Downloading {SERIES_NAME} from Yahoo Finance...")
    ticker = yf.Ticker(SERIES_NAME)
    df = ticker.history(period="max")

    if df.empty:
        print("❌ No data returned from Yahoo Finance")
        return

    df = df[['Close']].dropna()
    df.index = df.index.strftime('%Y-%m-%d')
    print(f"✓ Downloaded {len(df)} rows ({df.index[0]} to {df.index[-1]})")

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    try:
        # Upsert series_metadata
        cursor.execute("""
            INSERT INTO series_metadata (asset_class, series_name, display_name, units, currency)
            VALUES (?, ?, ?, ?, 'USD')
            ON CONFLICT(asset_class, series_name)
            DO UPDATE SET display_name = excluded.display_name,
                          units = excluded.units,
                          currency = excluded.currency
        """, (ASSET_CLASS, SERIES_NAME, DISPLAY_NAME, UNITS))

        # Insert time series data
        inserted = updated = 0
        for date_str, row in df.iterrows():
            cursor.execute("""
                INSERT INTO time_series (date, asset_class, series_name, column_name, value)
                VALUES (?, ?, ?, 'Value', ?)
                ON CONFLICT(date, asset_class, series_name, column_name)
                DO UPDATE SET value = excluded.value
            """, (date_str, ASSET_CLASS, SERIES_NAME, float(row['Close'])))
            if cursor.rowcount == 1:
                inserted += 1
            else:
                updated += 1

        conn.commit()
        print(f"✓ Inserted: {inserted}, Updated: {updated}")
        print(f"✓ {DISPLAY_NAME} ({SERIES_NAME}) is now in the DB under '{ASSET_CLASS}'")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()
