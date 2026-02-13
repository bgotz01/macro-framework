-- S&P 500 constituents and changes tracking

-- Current S&P 500 constituents
CREATE TABLE IF NOT EXISTS sp500_constituents (
  symbol TEXT PRIMARY KEY,
  security TEXT NOT NULL,
  gics_sector TEXT,
  gics_sub_industry TEXT,
  headquarters_location TEXT,
  date_added TEXT,  -- Date when added to S&P 500
  cik INTEGER,
  founded TEXT,
  extra_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sp500_sector ON sp500_constituents(gics_sector);
CREATE INDEX IF NOT EXISTS idx_sp500_date_added ON sp500_constituents(date_added);

-- Historical changes to S&P 500 composition
CREATE TABLE IF NOT EXISTS sp500_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
