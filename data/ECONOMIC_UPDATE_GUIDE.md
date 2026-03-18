# Economic Data Update Guide

All economic series use monthly data sourced from FRED (Federal Reserve Economic Data).
After downloading fresh CSVs, run the update pipeline to import and recalculate derived series.

## Quick Start

```bash
bash scripts/update-economic-data.sh
```

---

## Series Reference

### Manually Downloaded from FRED (place in `data/economic/US/`)

| Series | FRED Code | File | Description | Frequency |
|--------|-----------|------|-------------|-----------|
| CPI Nominal | CPIAUCSL | `US/CPIAUCSL.csv` | Consumer Price Index (index level) | Monthly |
| M1 Money Supply | M1SL | `US/M1SL.csv` | M1 broad money | Monthly |
| M2 Money Supply | M2SL | `US/M2SL.csv` | M2 broad money | Monthly |
| Fed Funds Rate | FEDFUNDS | `US/FEDFUNDS.csv` | Effective federal funds rate | Monthly |
| PCE | PCE | `US/PCE.csv` | Personal Consumption Expenditures | Monthly |
| GDP | GDP | `US/GDP.csv` | Gross Domestic Product | Quarterly |
| Disposable Income | DPI | `US/DPI.csv` | Disposable Personal Income | Monthly |
| Total Public Debt | GFDEBTN | `US/GFDEBTN.csv` | Federal debt outstanding | Monthly |
| Public Debt % GDP | GFDEGDQ188S | `US/GFDEGDQ188S.csv` | Federal debt as % of GDP | Quarterly |
| Federal Deficit | FYFSD | `US/FYFSD.csv` | Federal surplus/deficit | Annual |
| Deficit % GDP | FYFSGDA188S | `US/FYFSGDA188S.csv` | Federal deficit as % of GDP | Annual |
| Gross Federal Debt | FYGFD | `US/FYGFD.csv` | Gross federal debt | Annual |
| Household Debt | CMDEBT | `US/CMDEBT.csv` | Household debt outstanding | Quarterly |
| Corporate Debt | BCNSDODNS | `US/BCNSDODNS.csv` | Nonfinancial corporate debt | Quarterly |
| Federal Interest | A091RC1Q027SBEA | `US/A091RC1Q027SBEA.csv` | Federal interest payments | Quarterly |
| Federal Tax Receipts | W006RC1Q027SBEA | `US/W006RC1Q027SBEA.csv` | Federal tax receipts | Quarterly |
| Foreign-held Debt | FDHBFIN | `US/FDHBFIN.csv` | Federal debt held by foreign investors | Quarterly |

### Manually Downloaded from FRED (place in `data/economic/`)

| Series | FRED Code | File | Description | Frequency |
|--------|-----------|------|-------------|-----------|
| Money Market Funds | MMMFFAQ027S | `MMMFFAQ027S.csv` | Total money market fund assets | Quarterly |
| Retail Money Market | WRMFNS | `WRMFNS.csv` | Retail money market funds | Weekly |
| Mutual Fund Assets | BOGZ1LM654090000Q | `BOGZ1LM654090000Q.csv` | Mutual fund total assets | Quarterly |
| Pension Fund Assets | BOGZ1FL594090005Q | `BOGZ1FL594090005Q.csv` | Pension fund total assets | Quarterly |
| Corp Equities % Assets | BOGZ1FL153064486Q | `BOGZ1FL153064486Q.csv` | Corporate equities as % of assets | Quarterly |

### Derived Series (auto-calculated, no manual download needed)

| Series | Source | Description |
|--------|--------|-------------|
| CPINominal | CPIAUCSL.csv | Raw CPI index level (converted to Date/Value format) |
| CPI | CPINominal | CPI Year-over-Year % change |
| M1-YoY | M1SL | M1 Year-over-Year % change |
| M2-YoY | M2SL | M2 Year-over-Year % change |
| Real-M2-YoY | M2-YoY, CPI | Real M2 growth (M2 YoY minus CPI YoY) |

---

## FRED CSV Format

FRED exports use `observation_date` as the date column. The import scripts handle this automatically for series in `data/economic/US/` that go through `import-data-incremental.ts`.

**Exception:** `CPIAUCSL.csv` must be pre-processed via `convert-cpiaucsl.ts` before import because it needs to be converted to `Date,Value` format and stored as `CPINominal`.

Expected format from FRED:
```csv
observation_date,SERIESCODE
2025-01-01,123.45
2025-02-01,124.10
```

---

## Step-by-Step Pipeline

### 1. Download fresh data from FRED
Go to https://fred.stlouisfed.org, search each series code, and download as CSV.
Place files in `data/economic/US/` (or `data/economic/` for the non-US files listed above).

### 2. Run the update script
```bash
bash scripts/update-economic-data.sh
```

This runs in order:
1. `convert-cpiaucsl.ts` — converts `CPIAUCSL.csv` → `CPINominal.csv`
2. `import-data-incremental.ts` — imports all new CSV rows into DB
3. `import-new-economic-data.ts` — imports money market / debt series
4. `calculate-cpi-yoy.ts` — recalculates CPI YoY %
5. `add-m1-m2-money-supply.ts` — recalculates M1/M2 YoY and Real M2
6. `calculate-monthly-averages-incremental.ts` — updates MA12 for CPI, CPINominal, Shiller PE
7. `calculate-percentiles.ts` — updates historical percentile ranks

### 3. Verify
```bash
sqlite3 data/macro-data.db "SELECT series_name, MAX(date) as last_date FROM time_series WHERE asset_class = 'economic' AND column_name = 'Value' GROUP BY series_name ORDER BY series_name;"
```

---

## Troubleshooting

**"No such file" error on CPIAUCSL**
Make sure the file is at `data/economic/US/CPIAUCSL.csv`, not `data/economic/CPIAUCSL.csv`.

**CPI shows no data in the economics chart**
The chart filters out `units = 'percent'` series. CPI YoY is intentionally hidden there.
Use `CPINominal` (the index level) in the economics chart instead.
CPI YoY appears in the regime/matrix pages.

**Series not updating**
Check that the CSV date column is named `Date` (not `observation_date`).
FRED exports use `observation_date` — the incremental importer will reject these with "Missing Date column".
Only `CPIAUCSL.csv` is handled specially via `convert-cpiaucsl.ts`.
For other FRED series, rename the column or add them to `import-new-economic-data.ts`.
