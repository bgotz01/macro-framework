# Data Sources & Infrastructure

This document describes the data providers, derived series, database schema, and asset class taxonomy used in the macro framework application.

---

## Data Providers

### Yahoo Finance (via yfinance Python library)
- **Equity indexes**: S&P 500 (^GSPC), NASDAQ (^IXIC), Dow Jones (^DJI), Russell 2000 (^RUT), FTSE 100, DAX, Nikkei 225, Hang Seng, S&P/TSX, BIST 100, MERVAL
- **Bond yields**: 10Y Treasury (^TNX), 5Y Treasury (^FVX), 3M Treasury (^IRX), 30Y Treasury (^TYX), 2Y Treasury
- **Commodities**: Gold (GC=F), Crude Oil (CL=F), Silver (SI=F)
- **FX**: EUR/USD, GBP/USD, USD/JPY, USD/TRY, USD/ARS, USD/CAD
- **Crypto**: Bitcoin (BTC-USD), Ethereum (ETH-USD)
- **Volatility**: VIX

### FRED (Federal Reserve Economic Data)
Manually downloaded CSVs from fred.stlouisfed.org:
- **CPI**: CPIAUCSL (Consumer Price Index, nominal level → converted to YoY % change)
- **Fed Funds Rate**: FEDFUNDS
- **Money Supply**: M1SL (M1), M2SL (M2)
- **GDP, PCE** (Personal Consumption), **DPI** (Disposable Personal Income)
- **Debt**: GFDEBTN (Total Public Debt), GFDEGDQ188S (Debt % GDP), CMDEBT (Household Debt), BCNSDODNS (Corporate Debt), FYGFD (Gross Federal Debt)
- **Fiscal**: FYFSD (Federal Surplus/Deficit), FYFSGDA188S (Deficit % GDP), W006RC1Q027SBEA (Tax Receipts), A091RC1Q027SBEA (Interest Payments)
- **Foreign**: FDHBFIN (Federal Debt Held by Foreign Investors)
- **Financial**: MMMFFAQ027S (Money Market Funds), BOGZ1LM654090000Q (Mutual Fund Assets), BOGZ1FL594090005Q (Pension Fund Assets), BOGZ1FL153064486Q (Corporate Equities % of Assets)

### Robert Shiller's Data
- Shiller P/E (CAPE) — Cyclically Adjusted P/E using 10-year rolling earnings

### Multpl.com / GuruFocus / YCharts
- S&P 500 EPS (Earnings Per Share, trailing 12 months and historical)

---

## Derived Series

Auto-calculated from source data:

| Series | Formula |
|--------|---------|
| Real-10Y | TNX-Monthly − CPI |
| Real-3M | IRX-Monthly − CPI |
| Real-Earnings-Yield-5yr | Earnings Yield (5yr) − CPI |
| Earnings-Yield-Premium-5yr | Earnings Yield (5yr) − IRX-Monthly |
| Yield-Curve-10Y-3M | TNX-Monthly − IRX-Monthly |
| PE-5yr | SP500-Price / SP500-EPS-5yr |
| Earnings-Yield-5yr | (1 / PE-5yr) × 100 |
| CPI YoY | Year-over-year % change from CPIAUCSL |
| M1-YoY, M2-YoY | Year-over-year % change from M1SL, M2SL |
| Real-M2-YoY | M2 YoY − CPI YoY |
| TNX-Monthly, IRX-Monthly | Monthly averages of daily yields, stored at month-end dates |

---

## Date Convention

All monthly data uses **month-end dates** (e.g., 2025-01-31 for January 2025, not 2025-01-01). FRED data arrives as first-of-month and is converted to end-of-month during preprocessing. Daily data (equities, bonds) is averaged into monthly values using month-end dates. This ensures consistent alignment across all series for regime calculations and percentile analysis.

---

## Database Schema

All data is stored in a **Postgres database** (`macro-framework`):

| Table | Contents |
|-------|---------|
| `macro_time_series` | All raw and derived time series data |
| `macro_percentile_analysis` | Expanding-window percentile ranks for each series |
| `macro_series_metadata` | Display names, descriptions, units |
| `macro_regime_timeline` | Persistent regime state machine history |
| `sp500_constituents` | Current S&P 500 members |
| `sp500_changes` | Historical additions/removals |

In production the app connects to **Neon** (serverless Postgres). Locally it connects to a local Postgres instance.

---

## Asset Class Taxonomy

| Asset Class | Contents |
|-------------|---------|
| `economic` | CPI, Fed Funds, M1, M2, GDP, debt, fiscal data |
| `bonds` | Treasury yields (daily and monthly averages) |
| `equities` | Stock indexes (daily) |
| `valuations` | Shiller-PE, PE-5yr, Earnings Yield, SP500-Price, SP500-EPS, P/S ratios |
| `derived` | Real yields, yield curves, earnings yield premium, real earnings yield |
| `commodities` | Gold, Oil, Silver |
| `fx` | Currency pairs |
| `volatility` | VIX |
| `crypto` | Bitcoin, Ethereum |
