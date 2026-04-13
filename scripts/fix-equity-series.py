#!/usr/bin/env python3
"""
Fixes missing/incomplete equity series in macro-framework by copying from stockdata.
- US/IXIC: full history (was deleted, only had 16 rows)
- US/DJI: extend with DJI data (goes back to 1900 vs 2006)
"""

import psycopg2
import psycopg2.extras

SRC_DSN = "postgresql://postgres:koinare@localhost:5432/stockdata"
DST_DSN = "postgresql://borisgotzev:koinare@localhost:5432/macro-framework"
BATCH_SIZE = 5000

def fix():
    src = psycopg2.connect(SRC_DSN)
    dst = psycopg2.connect(DST_DSN)
    src_cur = src.cursor()
    dst_cur = dst.cursor()

    # --- US/IXIC: copy full history from stockdata (Value only) ---
    print("Copying US/IXIC from stockdata...")
    src_cur.execute("""
        SELECT date, asset_class, series_name, column_name, value
        FROM macro_time_series
        WHERE asset_class = 'equities' AND series_name = 'US/IXIC'
          AND column_name = 'Value'
        ORDER BY date ASC
    """)
    rows = src_cur.fetchall()
    psycopg2.extras.execute_values(dst_cur, """
        INSERT INTO macro_time_series (date, asset_class, series_name, column_name, value)
        VALUES %s ON CONFLICT DO NOTHING
    """, rows, page_size=BATCH_SIZE)
    dst.commit()
    print(f"  {len(rows)} rows copied.")

    # --- DJI: copy as US/DJI to fill in pre-2006 history (Value only) ---
    print("Extending US/DJI with DJI historical data (pre-2006)...")
    src_cur.execute("""
        SELECT date, 'equities', 'US/DJI', column_name, value
        FROM macro_time_series
        WHERE asset_class = 'equities' AND series_name = 'DJI'
          AND column_name = 'Value'
          AND date < '2006-02-14'
        ORDER BY date ASC
    """)
    rows = src_cur.fetchall()
    psycopg2.extras.execute_values(dst_cur, """
        INSERT INTO macro_time_series (date, asset_class, series_name, column_name, value)
        VALUES %s ON CONFLICT DO NOTHING
    """, rows, page_size=BATCH_SIZE)
    dst.commit()
    print(f"  {len(rows)} rows copied.")

    # Verify
    dst_cur.execute("""
        SELECT series_name, COUNT(*) as rows, MIN(date) as oldest, MAX(date) as newest
        FROM macro_time_series
        WHERE asset_class = 'equities' AND series_name IN ('US/IXIC', 'US/DJI')
          AND column_name = 'Value'
        GROUP BY series_name
        ORDER BY series_name
    """)
    print("\nVerification:")
    for row in dst_cur.fetchall():
        print(f"  {row[0]}: {row[1]} rows, {row[2]} → {row[3]}")

    src.close()
    dst.close()
    print("\nDone.")

if __name__ == "__main__":
    fix()
