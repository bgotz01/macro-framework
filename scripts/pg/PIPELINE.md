# Postgres Data Pipeline

All scripts write to the local Postgres DB (`stockdata`). SQLite (`data/macro-data.db`) is kept as a read-only backup and is no longer the source of truth for the app.

---

## Regular Update (run weekly or after new data is available)

```bash
bash scripts/pg/update-all.sh
```

### What it does (in order):

| Step | Script | Description |
|------|--------|-------------|
| 1 | `batch_update_all.py` | Fetches latest prices from Yahoo Finance → writes CSV files to `data/` |
| 2 | `import-data-incremental.ts` | Imports new CSV rows into `macro_time_series` + `macro_series_metadata` |
| 3 | `add-cyclical-returns.ts` | Calculates 2Y/5Y/10Y returns for equities, commodities, crypto, volatility |
| 4 | `add-volatility-metrics.ts` | Calculates 63/126/252/504-day rolling volatility for equities and bonds |
| 5 | `calculate-monthly-bond-yields.ts` | Derives month-end series from daily: `US/TNX-Monthly`, `US/IRX-Monthly`, `US/US-2yr-Monthly`, `SP500-Price` |
| 5b | `calculate-derived-series.ts` | Calculates Real-10Y, Real-3M, Yield Curves, EYP, REY (incremental) |
| 6 | `calculate-percentiles.ts` | Calculates percentile ranks for key macro series |
| 7 | `calculate-sp500-moving-averages.ts` | 50/200/500-day MAs for S&P 500 |
| 8 | `calculate-sp500-ma-divergence.ts` | Price divergence from MAs |
| 8 | `calculate-sp500-ma-slope.ts` | Daily % slope of each MA |
| 8 | `calculate-sp500-ma-stats.ts` | Slope streaks and price-above-MA streaks |
| 9 | `calculate-ma-percentiles.ts` | Percentile ranks for all MA-derived series |

---

## Manual Data Entry (monthly)

Use the app's `/data-input` page to enter:

| Series | Source | Frequency |
|--------|--------|-----------|
| CPI-U (Nominal Index) | [BLS](https://www.bls.gov/cpi/) | 10th–13th of month. Auto-calculates YoY and saves to `CPI` series. |
| M2 ($B) | [FRED WM2NS](https://fred.stlouisfed.org/series/WM2NS) | 4th Tuesday of month. Auto-calculates YoY. |
| SP500 EPS (Quarterly) | [GuruFocus](https://www.gurufocus.com/economic_indicators/4281/sp-500-eps-with-estimate-ttm) / [S&P Global](https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-eps-est.xlsx) | Quarterly. Auto-calculates TTM and fills 3 months. |

After manual entry, run:
```bash
npx tsx scripts/pg/calculate-pe5yr.ts
npx tsx scripts/pg/calculate-derived-series.ts
npx tsx scripts/pg/calculate-percentiles.ts
npx tsx scripts/pg/calculate-yoy-percentile-change.ts
```

---

## One-Time Full Recalculation

Use when source data has been revised (e.g. new CPI source, backfill):

```bash
bash scripts/pg/recalculate-all.sh
```

This runs `calculate-derived-series.ts --force` and `calculate-percentiles.ts --force`.

---

## Key Series & Where They Come From

### Stored in `macro_time_series`

| Series | Asset Class | Source |
|--------|-------------|--------|
| `CPINominal` | economic | Manual entry (BLS CPI-U NSA) |
| `CPI` | economic | Calculated: `(CPINominal / CPINominal_prev_year - 1) * 100` |
| `M2SL` | economic | Manual entry (FRED WM2NS) |
| `M2-YoY` | economic | Calculated from M2SL |
| `US/TNX`, `US/IRX`, `US/US-2yr` | bonds | Yahoo Finance (daily) |
| `US/TNX-Monthly`, `US/IRX-Monthly`, `US/US-2yr-Monthly` | bonds | Last trading day of month from daily |
| `SP500-Price` | valuations | Last trading day of month from `equities/US/GSPC` |
| `SP500-EPS` | valuations | Manual entry (TTM, filled across 3 months) |
| `SP500-EPS-Quarterly` | valuations | Manual entry (quarterly actuals) |
| `SP500-EPS-2yr`, `SP500-EPS-5yr` | valuations | Rolling average EPS |
| `PE-2yr`, `PE-5yr` | valuations | `SP500-Price / SP500-EPS-Nyr` |
| `Earnings-Yield-2yr`, `Earnings-Yield-5yr` | valuations | `100 / PE-Nyr` |
| `Real-10Y` | derived | `US/TNX-Monthly - CPI` |
| `Real-3M` | derived | `US/IRX-Monthly - CPI` |
| `Yield-Curve` | derived | `US/TNX-Monthly - US/US-2yr-Monthly` |
| `Yield-Curve-10Y-3M` | derived | `US/TNX-Monthly - US/IRX-Monthly` |
| `Earnings-Yield-Premium-5yr` | derived | `(100/PE-5yr) - US/IRX-Monthly` |
| `Earnings-Yield-Premium-2yr` | derived | `(100/PE-2yr) - US/IRX-Monthly` |
| `Real-Earnings-Yield-5yr` | derived | `Earnings-Yield-5yr - CPI` |
| `Real-Earnings-Yield-2yr` | derived | `Earnings-Yield-2yr - CPI` |

### Stored in `macro_percentile_analysis`

Percentile ranks (0–100) for all key series above, calculated against full historical data.

---

## Historical Data Imports (one-time)

| Script | Description |
|--------|-------------|
| `import-cpi-bls.ts` | Imports full BLS CPI-U history from `data/cpi/CPI-U-BLS.csv` |
| `import-eps-quarterly.ts` | Imports quarterly EPS history from `data/eps/sp500-eps.csv` |
| `migrate-sqlite-data.py` | One-time migration of all SQLite tables to Postgres |
