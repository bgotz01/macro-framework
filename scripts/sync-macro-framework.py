#!/usr/bin/env python3
"""
Syncs macro data from stockdata -> macro-framework.
Copies all asset classes except 'stocks' and 'indices' (stock-specific data).
Safe to re-run - uses ON CONFLICT DO NOTHING.
"""

import psycopg2
import psycopg2.extras

SRC_DSN = "postgresql://postgres:koinare@localhost:5432/stockdata"
DST_DSN = "postgresql://borisgotzev:koinare@localhost:5432/macro-framework"
BATCH_SIZE = 5000

EXCLUDE_ASSET_CLASSES = ('stocks', 'indices')

def sync():
    print("Connecting to source (stockdata)...")
    src = psycopg2.connect(SRC_DSN)
    print("Connecting to destination (macro-framework)...")
    dst = psycopg2.connect(DST_DSN)

    src_cur = src.cursor()
    dst_cur = dst.cursor()

    # --- macro_series_metadata ---
    print("\nSyncing macro_series_metadata...")
    src_cur.execute("""
        SELECT asset_class, series_name, display_name, description, source,
               last_updated, geography, units, currency
        FROM macro_series_metadata
        WHERE asset_class NOT IN %s
    """, (EXCLUDE_ASSET_CLASSES,))
    rows = src_cur.fetchall()
    psycopg2.extras.execute_values(dst_cur, """
        INSERT INTO macro_series_metadata
            (asset_class, series_name, display_name, description, source,
             last_updated, geography, units, currency)
        VALUES %s ON CONFLICT DO NOTHING
    """, rows, page_size=BATCH_SIZE)
    dst.commit()
    print(f"  {len(rows)} rows synced.")

    # --- macro_regime_timeline ---
    print("\nSyncing macro_regime_timeline...")
    src_cur.execute("""
        SELECT date, regime, entry_date, trigger_reason, liquidity_score,
               rey, eyp, "real10Y", "real3M", "realM2"
        FROM macro_regime_timeline
    """)
    rows = src_cur.fetchall()
    psycopg2.extras.execute_values(dst_cur, """
        INSERT INTO macro_regime_timeline
            (date, regime, entry_date, trigger_reason, liquidity_score,
             rey, eyp, "real10Y", "real3M", "realM2")
        VALUES %s ON CONFLICT DO NOTHING
    """, rows, page_size=BATCH_SIZE)
    dst.commit()
    print(f"  {len(rows)} rows synced.")

    # --- macro_time_series (large - stream in batches) ---
    print("\nSyncing macro_time_series (excluding stocks/indices)...")
    src_cur.execute("SELECT COUNT(*) FROM macro_time_series WHERE asset_class NOT IN %s", (EXCLUDE_ASSET_CLASSES,))
    total = src_cur.fetchone()[0]
    print(f"  Total rows to sync: {total:,}")

    src_cur.execute("""
        SELECT date, asset_class, series_name, column_name, value
        FROM macro_time_series
        WHERE asset_class NOT IN %s
          AND column_name IN ('Value', 'value')
        ORDER BY asset_class, series_name, date
    """, (EXCLUDE_ASSET_CLASSES,))

    synced = 0
    while True:
        rows = src_cur.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_values(dst_cur, """
            INSERT INTO macro_time_series (date, asset_class, series_name, column_name, value)
            VALUES %s ON CONFLICT DO NOTHING
        """, rows, page_size=BATCH_SIZE)
        dst.commit()
        synced += len(rows)
        print(f"  {synced:,}/{total:,} rows...", end="\r")
    print(f"\n  {synced:,} rows synced.")

    # --- macro_percentile_analysis (large - stream in batches) ---
    print("\nSyncing macro_percentile_analysis (excluding stocks/indices)...")
    src_cur.execute("SELECT COUNT(*) FROM macro_percentile_analysis WHERE asset_class NOT IN %s", (EXCLUDE_ASSET_CLASSES,))
    total = src_cur.fetchone()[0]
    print(f"  Total rows to sync: {total:,}")

    src_cur.execute("""
        SELECT date, asset_class, series_name, column_name, value,
               percentile_rank, yoy_percentile_change
        FROM macro_percentile_analysis
        WHERE asset_class NOT IN %s
        ORDER BY asset_class, series_name, date
    """, (EXCLUDE_ASSET_CLASSES,))

    synced = 0
    while True:
        rows = src_cur.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_values(dst_cur, """
            INSERT INTO macro_percentile_analysis
                (date, asset_class, series_name, column_name, value,
                 percentile_rank, yoy_percentile_change)
            VALUES %s ON CONFLICT DO NOTHING
        """, rows, page_size=BATCH_SIZE)
        dst.commit()
        synced += len(rows)
        print(f"  {synced:,}/{total:,} rows...", end="\r")
    print(f"\n  {synced:,} rows synced.")

    src.close()
    dst.close()
    print("\nDone. macro-framework is now up to date.")

if __name__ == "__main__":
    sync()
