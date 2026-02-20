# Volatility Metrics Calculator

This script calculates historical volatility metrics for all equity indexes in the database.

## What it does

Calculates rolling annualized standard deviations for four time windows:
- **63-day** (approximately 3 months of trading days)
- **126-day** (approximately 6 months of trading days)  
- **252-day** (approximately 1 year of trading days)
- **504-day** (approximately 2 years of trading days)

## Methodology

1. Extracts daily price data for each equity series
2. Calculates daily returns: `(price_today - price_yesterday) / price_yesterday`
3. For each date, calculates rolling standard deviation over the specified window
4. Annualizes the volatility: `stddev * sqrt(252)` 
5. Converts to percentage for display

## Output columns

The script adds four new columns to the `time_series` table for each equity series:
- `Value_Vol63` - 63-day annualized volatility (%)
- `Value_Vol126` - 126-day annualized volatility (%)
- `Value_Vol252` - 252-day annualized volatility (%)
- `Value_Vol504` - 504-day annualized volatility (%)

## Usage

```bash
npx tsx scripts/add-volatility-metrics.ts
```

## Notes

- Volatility is annualized using the standard sqrt(252) factor
- Values are stored as percentages (e.g., 20.5 means 20.5% annualized volatility)
- The first N data points for each series will not have volatility values (where N is the window size)
- Higher volatility indicates more price fluctuation and risk
- Typical equity volatility ranges from 10-30% in normal markets, higher during crises

## Viewing the data

After running this script, volatility data will be available in:
- The Volatility Chart at `/chart?type=volatility`
- The API endpoint: `/api/data/equities?series=US/GSPC&columns=Value_Vol63,Value_Vol126,Value_Vol252,Value_Vol504`
