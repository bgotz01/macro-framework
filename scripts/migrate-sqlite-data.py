#!/usr/bin/env python3
"""
Copies data from SQLite macro-data.db into Postgres.
SQLite is not modified - this is read-only on the source.
"""

import sqlite3
import psycopg2
import psycopg2.extras
import sys

SQLITE_PATH = "data/macro-data.db"
PG_DSN = "postgresql://borisgotzev:koinare@localhost:5432/stockdata"
BATCH_SIZE = 5000

def migrate(sqlite_conn, pg_conn):
    sc = sqlite_conn.cursor()
    pg = pg_conn.cursor()

    # --- macro_series_metadata ---
    print("Migrating series_metadata -> macro_series_metadata...")
    sc.execute("SELECT asset_class, series_name, display_name, description, source, last_updated, geography, units, currency FROM series_metadata")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO macro_series_metadata
           (asset_class, series_name, display_name, description, source, last_updated, geography, units, currency)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- macro_regime_timeline ---
    print("Migrating regime_timeline -> macro_regime_timeline...")
    sc.execute("SELECT date, regime, entry_date, trigger_reason, liquidity_score, rey, eyp, real10Y, real3M, realM2 FROM regime_timeline")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO macro_regime_timeline
           (date, regime, entry_date, trigger_reason, liquidity_score, rey, eyp, "real10Y", "real3M", "realM2")
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- sp500_constituents ---
    print("Migrating sp500_constituents...")
    sc.execute("SELECT symbol, security, gics_sector, gics_sub_industry, headquarters_location, date_added, cik, founded, extra_notes FROM sp500_constituents")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO sp500_constituents
           (symbol, security, gics_sector, gics_sub_industry, headquarters_location, date_added, cik, founded, extra_notes)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- sp500_changes ---
    print("Migrating sp500_changes...")
    sc.execute("SELECT date, added_ticker, added_company, removed_ticker, removed_company, reason FROM sp500_changes")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO sp500_changes
           (date, added_ticker, added_company, removed_ticker, removed_company, reason)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- sp500_snapshots ---
    print("Migrating sp500_snapshots...")
    sc.execute("SELECT snapshot_date, ticker, company_name FROM sp500_snapshots")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO sp500_snapshots (snapshot_date, ticker, company_name)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- sp500_wharton ---
    print("Migrating sp500_wharton...")
    sc.execute("SELECT permno, company, ticker, action, start_date, end_date FROM sp500_wharton")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO sp500_wharton (permno, company, ticker, action, start_date, end_date)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- sp500_snapshots_wharton ---
    print("Migrating sp500_snapshots_wharton...")
    sc.execute("SELECT snapshot_date, permno, ticker, company FROM sp500_snapshots_wharton")
    rows = sc.fetchall()
    psycopg2.extras.execute_values(pg,
        """INSERT INTO sp500_snapshots_wharton (snapshot_date, permno, ticker, company)
           VALUES %s ON CONFLICT DO NOTHING""",
        rows, page_size=BATCH_SIZE)
    pg_conn.commit()
    print(f"  {len(rows)} rows done.")

    # --- macro_time_series (large - stream in batches) ---
    print("Migrating time_series -> macro_time_series (3M rows, this will take a while)...")
    sc.execute("SELECT COUNT(*) FROM time_series")
    total = sc.fetchone()[0]
    sc.execute("SELECT date, asset_class, series_name, column_name, value FROM time_series")
    migrated = 0
    while True:
        rows = sc.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_values(pg,
            """INSERT INTO macro_time_series (date, asset_class, series_name, column_name, value)
               VALUES %s ON CONFLICT DO NOTHING""",
            rows, page_size=BATCH_SIZE)
        pg_conn.commit()
        migrated += len(rows)
        print(f"  {migrated}/{total} rows...", end="\r")
    print(f"\n  {migrated} rows done.")

    # --- macro_percentile_analysis (large - stream in batches) ---
    print("Migrating percentile_analysis -> macro_percentile_analysis (550K rows)...")
    sc.execute("SELECT COUNT(*) FROM percentile_analysis")
    total = sc.fetchone()[0]
    sc.execute("SELECT date, asset_class, series_name, column_name, value, percentile_rank, yoy_percentile_change FROM percentile_analysis")
    migrated = 0
    while True:
        rows = sc.fetchmany(BATCH_SIZE)
        if not rows:
            break
        psycopg2.extras.execute_values(pg,
            """INSERT INTO macro_percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank, yoy_percentile_change)
               VALUES %s ON CONFLICT DO NOTHING""",
            rows, page_size=BATCH_SIZE)
        pg_conn.commit()
        migrated += len(rows)
        print(f"  {migrated}/{total} rows...", end="\r")
    print(f"\n  {migrated} rows done.")

if __name__ == "__main__":
    print(f"Connecting to SQLite: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)

    print(f"Connecting to Postgres: stockdata")
    pg_conn = psycopg2.connect(PG_DSN)

    try:
        migrate(sqlite_conn, pg_conn)
        print("\nAll done. SQLite untouched.")
    except Exception as e:
        pg_conn.rollback()
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        sqlite_conn.close()
        pg_conn.close()
