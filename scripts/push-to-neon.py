#!/usr/bin/env python3
"""
Pushes macro data from local macro-framework -> Neon (production).
Streams in batches. Safe to re-run - uses ON CONFLICT DO NOTHING.
"""

import psycopg2
import psycopg2.extras

SRC_DSN = "postgresql://borisgotzev:koinare@localhost:5432/macro-framework"
DST_DSN = "postgresql://neondb_owner:npg_vcBVa7Cm4URu@ep-wild-breeze-amav0gsv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
BATCH_SIZE = 2000  # Smaller batches for network transfer

def push():
    print("Connecting to source (local macro-framework)...")
    src = psycopg2.connect(SRC_DSN)
    print("Connecting to destination (Neon)...")
    dst = psycopg2.connect(DST_DSN)

    src_cur = src.cursor()
    dst_cur = dst.cursor()

    # --- macro_series_metadata ---
    print("\nPushing macro_series_metadata...")
    src_cur.execute("""
        SELECT asset_class, series_name, display_name, description, source,
               last_updated, geography, units, currency
        FROM macro_series_metadata
    """)
    rows = src_cur.fetchall()
    psycopg2.extras.execute_values(dst_cur, """
        INSERT INTO macro_series_metadata
            (asset_class, series_name, display_name, description, source,
             last_updated, geography, units, currency)
        VALUES %s ON CONFLICT DO NOTHING
    """, rows, page_size=BATCH_SIZE)
    dst.commit()
    print(f"  {len(rows)} rows pushed.")

    # --- macro_regime_timeline ---
    print("\nPushing macro_regime_timeline...")
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
    print(f"  {len(rows)} rows pushed.")

    # --- macro_time_series ---
    print("\nPushing macro_time_series...")
    src_cur.execute("SELECT COUNT(*) FROM macro_time_series")
    total = src_cur.fetchone()[0]
    print(f"  Total rows: {total:,}")

    src_cur.execute("""
        SELECT date, asset_class, series_name, column_name, value
        FROM macro_time_series
        ORDER BY asset_class, series_name, date
    """)

    pushed = 0
    while True:
        rows = src_cur.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_values(dst_cur, """
            INSERT INTO macro_time_series (date, asset_class, series_name, column_name, value)
            VALUES %s ON CONFLICT DO NOTHING
        """, rows, page_size=BATCH_SIZE)
        dst.commit()
        pushed += len(rows)
        print(f"  {pushed:,}/{total:,} rows...", end="\r", flush=True)
    print(f"\n  {pushed:,} rows pushed.")

    # --- macro_percentile_analysis ---
    print("\nPushing macro_percentile_analysis...")
    src_cur.execute("SELECT COUNT(*) FROM macro_percentile_analysis")
    total = src_cur.fetchone()[0]
    print(f"  Total rows: {total:,}")

    src_cur.execute("""
        SELECT date, asset_class, series_name, column_name, value,
               percentile_rank, yoy_percentile_change
        FROM macro_percentile_analysis
        ORDER BY asset_class, series_name, date
    """)

    pushed = 0
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
        pushed += len(rows)
        print(f"  {pushed:,}/{total:,} rows...", end="\r", flush=True)
    print(f"\n  {pushed:,} rows pushed.")

    src.close()
    dst.close()
    print("\nDone. Neon is now up to date.")

if __name__ == "__main__":
    push()
