-- SQLite schema for macro data

CREATE TABLE IF NOT EXISTS time_series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date INTEGER NOT NULL,  -- Unix timestamp in milliseconds
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  value REAL,
  UNIQUE(date, asset_class, series_name, column_name)
);

CREATE INDEX IF NOT EXISTS idx_date ON time_series(date);
CREATE INDEX IF NOT EXISTS idx_asset_class ON time_series(asset_class);
CREATE INDEX IF NOT EXISTS idx_series ON time_series(series_name);
CREATE INDEX IF NOT EXISTS idx_composite ON time_series(asset_class, series_name, date);

CREATE TABLE IF NOT EXISTS series_metadata (
  asset_class TEXT NOT NULL,
  series_name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  geography TEXT,  -- Country/region code (e.g., 'US', 'UK', 'EU')
  units TEXT,  -- Units of measurement (e.g., 'billions', 'millions', 'percent', 'index')
  source TEXT,
  last_updated INTEGER,  -- Unix timestamp
  PRIMARY KEY(asset_class, series_name)
);
