# Cyclical Returns Calculation

This script pre-calculates rolling returns (2-year, 5-year, and 10-year) for all equity and market assets and stores them in the SQLite database.

## Usage

Run the script to calculate cyclical returns for all series in the database:

```bash
npm run calc-cyclical-returns
```

## What it does

1. Finds all series in the `equities`, `commodities`, `crypto`, and `volatility` asset classes
2. Assumes all data is **daily frequency** (252 trading days per year)
3. Calculates rolling returns:
   - **2-Year Return**: Return over the past 504 trading days (~2 years)
   - **5-Year Return**: Return over the past 1,260 trading days (~5 years)
   - **10-Year Return**: Return over the past 2,520 trading days (~10 years)
4. Stores the results in the database as new columns:
   - `Value_Return2Y`
   - `Value_Return5Y`
   - `Value_Return10Y`

## Asset Classes Processed

- **equities**: Stock indices (S&P 500, NASDAQ, etc.)
- **commodities**: Gold, Oil, etc.
- **crypto**: Bitcoin, Ethereum, etc.
- **volatility**: VIX, etc.

All these categories use daily data.

## Return Calculation

Returns are calculated as percentage changes:

```
Return = ((Current Value - Past Value) / Past Value) × 100
```

## Requirements

- Series must have at least 2,520 data points (~10 years of daily data) to calculate 10-year returns
- Returns are stored as percentages (e.g., 15.5 means 15.5%)

## Component Usage

After running the script, the `CyclicalReturns` component will display the pre-calculated returns:

```tsx
<CyclicalReturns 
    assetClass="equities"
    seriesName="SPX"
    height={300}
/>
```

The component fetches the pre-calculated returns from the database, making it fast and efficient.
