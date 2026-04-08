#!/usr/bin/env python3
"""
Download commodity futures from Yahoo Finance and import into macro-data.db.
"""

import sqlite3
import yfinance as yf
import time

DB_FILE = "data/macro-data.db"
ASSET_CLASS = "commodities"

COMMODITIES = [
    { "ticker": "HG=F",  "display": "Copper",          "units": "usd_per_lb"     },
    { "ticker": "ZC=F",  "display": "Corn",             "units": "usd_per_bushel" },
    { "ticker": "ZW=F",  "display": "Wheat",            "units": "usd_per_bushel" },
    { "ticker": "ZS=F",  "display": "Soybeans",         "units": "usd_per_bushel" },
    { "ticker": "RB=F",  "display": "Gasoline RBOB",    "units": "usd_per_gallon" },
    { "ticker": "HO=F",  "display": "Heating Oil",      "units": "usd_per_gallon" },
]

def import_commodity(cursor, ticker: str, display: str, units: str):
    print(f"📥 Downloading {display} ({ticker})...")
    df = yf.Ticker(ticker).history(period="max")[['Close']].dropna()
    df.index = df.index.strftime('%Y-%m-%d')

    if df.empty:
        print(f"  ❌ No data returned")
        return

    print(f"  ✓ {len(df)} rows ({df.index[0]} to {df.index[-1]})")

    cursor.execute("""
        INSERT INTO series_metadata (asset_class, series_name, display_name, units, currency)
        VALUES (?, ?, ?, ?, 'USD')
        ON CONFLICT(asset_class, series_name)
        DO UPDATE SET display_name = excluded.display_name,
                      units = excluded.units,
                      currency = excluded.currency
    """, (ASSET_CLASS, ticker, display, units))

    inserted = updated = 0
    for date_str, row in df.iterrows():
        cursor.execute("""
            INSERT INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, ?, ?, 'Value', ?)
            ON CONFLICT(date, asset_class, series_name, column_name)
            DO UPDATE SET value = excluded.value
        """, (date_str, ASSET_CLASS, ticker, float(row['Close'])))
        if cursor.rowcount == 1:
            inserted += 1
        else:
            updated += 1

    print(f"  ✓ Inserted: {inserted}, Updated: {updated}")

def main():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        for i, c in enumerate(COMMODITIES):
            import_commodity(cursor, c["ticker"], c["display"], c["units"])
            if i < len(COMMODITIES) - 1:
                time.sleep(0.5)
        conn.commit()
        print("\n✅ All done.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()
