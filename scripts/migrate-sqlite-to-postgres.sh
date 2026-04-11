#!/bin/bash
# Migrates SQLite macro-data.db to local Postgres (stockdata)
# SQLite is kept intact - this is a copy only

set -e

DB_URL="postgresql://borisgotzev:koinare@localhost:5432/stockdata"
SQLITE="data/macro-data.db"

echo "Creating tables in Postgres..."

psql "$DB_URL" <<'SQL'

CREATE TABLE IF NOT EXISTS macro_series_metadata (
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  source TEXT,
  last_updated BIGINT,
  geography TEXT,
  units TEXT,
  currency TEXT,
  PRIMARY KEY (asset_class, series_name)
);

CREATE TABLE IF NOT EXISTS macro_regime_timeline (
  date TEXT PRIMARY KEY,
  regime TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  liquidity_score REAL,
  rey REAL,
  eyp REAL,
  real10Y REAL,
  real3M REAL,
  realM2 REAL
);
CREATE INDEX IF NOT EXISTS idx_macro_regime_timeline_regime ON macro_regime_timeline(regime);
CREATE INDEX IF NOT EXISTS idx_macro_regime_timeline_entry_date ON macro_regime_timeline(entry_date);

CREATE TABLE IF NOT EXISTS macro_time_series (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  value REAL,
  UNIQUE(date, asset_class, series_name, column_name)
);
CREATE INDEX IF NOT EXISTS idx_macro_ts_date ON macro_time_series(date);
CREATE INDEX IF NOT EXISTS idx_macro_ts_asset_class ON macro_time_series(asset_class);
CREATE INDEX IF NOT EXISTS idx_macro_ts_series ON macro_time_series(series_name);
CREATE INDEX IF NOT EXISTS idx_macro_ts_composite ON macro_time_series(asset_class, series_name, date);

CREATE TABLE IF NOT EXISTS macro_percentile_analysis (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  value REAL,
  percentile_rank REAL,
  yoy_percentile_change REAL,
  UNIQUE(date, asset_class, series_name, column_name)
);
CREATE INDEX IF NOT EXISTS idx_macro_pct_date ON macro_percentile_analysis(date);
CREATE INDEX IF NOT EXISTS idx_macro_pct_composite ON macro_percentile_analysis(asset_class, series_name, date);

CREATE TABLE IF NOT EXISTS sp500_constituents (
  symbol TEXT PRIMARY KEY,
  security TEXT NOT NULL,
  gics_sector TEXT,
  gics_sub_industry TEXT,
  headquarters_location TEXT,
  date_added TEXT,
  cik INTEGER,
  founded TEXT,
  extra_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_sp500_sector ON sp500_constituents(gics_sector);
CREATE INDEX IF NOT EXISTS idx_sp500_date_added ON sp500_constituents(date_added);

CREATE TABLE IF NOT EXISTS sp500_changes (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  added_ticker TEXT,
  added_company TEXT,
  removed_ticker TEXT,
  removed_company TEXT,
  reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_sp500_changes_date ON sp500_changes(date);
CREATE INDEX IF NOT EXISTS idx_sp500_changes_added ON sp500_changes(added_ticker);
CREATE INDEX IF NOT EXISTS idx_sp500_changes_removed ON sp500_changes(removed_ticker);

CREATE TABLE IF NOT EXISTS sp500_snapshots (
  snapshot_date TEXT NOT NULL,
  ticker TEXT NOT NULL,
  company_name TEXT,
  PRIMARY KEY (snapshot_date, ticker)
);
CREATE INDEX IF NOT EXISTS idx_snapshot_date ON sp500_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_snapshot_ticker ON sp500_snapshots(ticker);

CREATE TABLE IF NOT EXISTS sp500_wharton (
  id SERIAL PRIMARY KEY,
  permno TEXT NOT NULL,
  company TEXT,
  ticker TEXT,
  action TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wharton_permno ON sp500_wharton(permno);
CREATE INDEX IF NOT EXISTS idx_wharton_ticker ON sp500_wharton(ticker);
CREATE INDEX IF NOT EXISTS idx_wharton_dates ON sp500_wharton(start_date, end_date);

CREATE TABLE IF NOT EXISTS sp500_snapshots_wharton (
  snapshot_date TEXT NOT NULL,
  permno TEXT NOT NULL,
  ticker TEXT,
  company TEXT,
  PRIMARY KEY (snapshot_date, permno)
);
CREATE INDEX IF NOT EXISTS idx_wharton_snapshot_date ON sp500_snapshots_wharton(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_wharton_snapshot_permno ON sp500_snapshots_wharton(permno);

SQL

echo "Tables created. Starting data migration..."

# Use python to stream data from SQLite to Postgres efficiently
python3 scripts/migrate-sqlite-data.py

echo "Migration complete."
