#!/usr/bin/env python3
"""
Import CFTC Commitments of Traders data into macro-data.db.
Usage: python3 data/cftc/import_cftc.py data/cftc/f_year.xls
       python3 data/cftc/import_cftc.py data/cftc/f_2025.xls  # add historical years
"""

import sys
import sqlite3
import pandas as pd
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "macro-data.db"

TARGET_MARKETS = {
    "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE":   "WTI Crude Oil",
    "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE": "Brent Crude Oil",
    "GASOLINE RBOB - NEW YORK MERCANTILE EXCHANGE":  "Gasoline RBOB",
    "NY HARBOR ULSD - NEW YORK MERCANTILE EXCHANGE": "NY Harbor ULSD",
    "HENRY HUB - NEW YORK MERCANTILE EXCHANGE":      "Natural Gas (Henry Hub)",
    "NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE":   "Natural Gas (NYME)",
    "GOLD - COMMODITY EXCHANGE INC.":                "Gold",
    "SILVER - COMMODITY EXCHANGE INC.":              "Silver",
    "COPPER- #1 - COMMODITY EXCHANGE INC.":          "Copper",
    "CORN - CHICAGO BOARD OF TRADE":                 "Corn",
    "SOYBEANS - CHICAGO BOARD OF TRADE":             "Soybeans",
    "WHEAT-SRW - CHICAGO BOARD OF TRADE":            "Wheat SRW",
    "WHEAT-HRW - CHICAGO BOARD OF TRADE":            "Wheat HRW",
    "SOYBEAN MEAL - CHICAGO BOARD OF TRADE":         "Soybean Meal",
    "SOYBEAN OIL - CHICAGO BOARD OF TRADE":          "Soybean Oil",
}

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS cftc_positioning (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    market_name         TEXT NOT NULL,        -- friendly name e.g. "WTI Crude Oil"
    market_raw          TEXT NOT NULL,        -- original CFTC name
    cftc_contract_code  TEXT,
    report_date         TEXT NOT NULL,        -- YYYY-MM-DD

    -- open interest
    open_interest       INTEGER,

    -- managed money (speculators / hedge funds)
    mm_long             INTEGER,
    mm_short            INTEGER,
    mm_spread           INTEGER,
    mm_long_pct         REAL,
    mm_short_pct        REAL,

    -- commercial (producers / hedgers)
    comm_long           INTEGER,
    comm_short          INTEGER,
    comm_long_pct       REAL,
    comm_short_pct      REAL,

    -- non-reportable (small speculators)
    nonrept_long        INTEGER,
    nonrept_short       INTEGER,

    -- week-over-week changes
    change_oi           INTEGER,
    change_mm_long      INTEGER,
    change_mm_short     INTEGER,

    -- derived
    mm_net              INTEGER,              -- mm_long - mm_short
    mm_net_pct          REAL,                 -- mm_net / open_interest * 100

    UNIQUE(market_raw, report_date)
);
"""

def load_file(path: str) -> pd.DataFrame:
    p = Path(path)
    if p.suffix in (".xls", ".xlsx"):
        return pd.read_excel(path)
    return pd.read_csv(path)

def import_file(path: str, conn: sqlite3.Connection):
    df = load_file(path)
    df = df[df["Market_and_Exchange_Names"].isin(TARGET_MARKETS.keys())].copy()
    df["report_date"] = pd.to_datetime(df["Report_Date_as_MM_DD_YYYY"]).dt.strftime("%Y-%m-%d")

    rows = []
    for _, row in df.iterrows():
        raw = row["Market_and_Exchange_Names"]
        oi  = int(row["Open_Interest_All"]) if pd.notna(row["Open_Interest_All"]) else None
        mm_l = int(row["M_Money_Positions_Long_ALL"])  if pd.notna(row["M_Money_Positions_Long_ALL"])  else None
        mm_s = int(row["M_Money_Positions_Short_ALL"]) if pd.notna(row["M_Money_Positions_Short_ALL"]) else None
        mm_sp = int(row["M_Money_Positions_Spread_ALL"]) if pd.notna(row["M_Money_Positions_Spread_ALL"]) else None

        mm_net     = (mm_l - mm_s) if (mm_l is not None and mm_s is not None) else None
        mm_net_pct = round(mm_net / oi * 100, 2) if (mm_net is not None and oi) else None

        rows.append((
            TARGET_MARKETS[raw],
            raw,
            str(row["CFTC_Contract_Market_Code"]) if pd.notna(row["CFTC_Contract_Market_Code"]) else None,
            row["report_date"],
            oi,
            mm_l, mm_s, mm_sp,
            float(row["Pct_of_OI_M_Money_Long_All"])  if pd.notna(row["Pct_of_OI_M_Money_Long_All"])  else None,
            float(row["Pct_of_OI_M_Money_Short_All"]) if pd.notna(row["Pct_of_OI_M_Money_Short_All"]) else None,
            int(row["Prod_Merc_Positions_Long_ALL"])   if pd.notna(row["Prod_Merc_Positions_Long_ALL"])  else None,
            int(row["Prod_Merc_Positions_Short_ALL"])  if pd.notna(row["Prod_Merc_Positions_Short_ALL"]) else None,
            float(row["Pct_of_OI_Prod_Merc_Long_All"])  if pd.notna(row["Pct_of_OI_Prod_Merc_Long_All"])  else None,
            float(row["Pct_of_OI_Prod_Merc_Short_All"]) if pd.notna(row["Pct_of_OI_Prod_Merc_Short_All"]) else None,
            int(row["NonRept_Positions_Long_All"])  if pd.notna(row["NonRept_Positions_Long_All"])  else None,
            int(row["NonRept_Positions_Short_All"]) if pd.notna(row["NonRept_Positions_Short_All"]) else None,
            int(row["Change_in_Open_Interest_All"]) if pd.notna(row["Change_in_Open_Interest_All"]) else None,
            int(row["Change_in_M_Money_Long_All"])  if pd.notna(row["Change_in_M_Money_Long_All"])  else None,
            int(row["Change_in_M_Money_Short_All"]) if pd.notna(row["Change_in_M_Money_Short_All"]) else None,
            mm_net,
            mm_net_pct,
        ))

    conn.executemany("""
        INSERT OR IGNORE INTO cftc_positioning (
            market_name, market_raw, cftc_contract_code, report_date,
            open_interest,
            mm_long, mm_short, mm_spread, mm_long_pct, mm_short_pct,
            comm_long, comm_short, comm_long_pct, comm_short_pct,
            nonrept_long, nonrept_short,
            change_oi, change_mm_long, change_mm_short,
            mm_net, mm_net_pct
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, rows)
    conn.commit()
    print(f"Imported {len(rows)} rows from {path}")

def main():
    files = sys.argv[1:] if len(sys.argv) > 1 else ["data/cftc/f_year.xls"]
    conn = sqlite3.connect(DB_PATH)
    conn.execute(CREATE_TABLE)
    conn.commit()
    for f in files:
        import_file(f, conn)
    conn.close()

    # quick verify
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""
        SELECT market_name, COUNT(*) as weeks, MIN(report_date), MAX(report_date)
        FROM cftc_positioning GROUP BY market_name ORDER BY market_name
    """).fetchall()
    print("\nTable summary:")
    for r in rows:
        print(f"  {r[0]:<30} {r[1]} weeks  {r[2]} → {r[3]}")
    conn.close()

if __name__ == "__main__":
    main()
