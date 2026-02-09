# Economic Data

This directory contains US economic data from FRED (Federal Reserve Economic Data).

## Data Frequency

The data includes multiple frequencies:
- **Quarterly**: GDP, debt metrics, income data
- **Monthly**: CPI, PCE, money supply
- **Annual**: Some debt metrics

## Series List

### Quarterly Data (4-period rolling average = 1 year)
- **GFDEBTN** - Total Public Debt
- **GFDEGDQ188S** - Total Public Debt as % of GDP
- **GDP** - Gross Domestic Product
- **CMDEBT** - Household Debt Outstanding
- **BCNSDODNS** - Nonfinancial Corporate Business Debt Securities
- **A091RC1Q027SBEA** - Federal Government Interest Payments
- **DPI** - Disposable Personal Income

### Monthly Data (12-period rolling average = 1 year)
- **PCE** - Personal Consumption Expenditures
- **M1SL** - M1 Money Stock
- **M2SL** - M2 Money Stock
- **CPI** - Consumer Price Index (YoY %)
- **CPIAUCSL** - Consumer Price Index (Nominal Level)

### Annual Data
- **FYGFD** - Federal Government Gross Debt

## Rolling Averages

All series have rolling averages calculated:
- Quarterly data: 4-period MA (1 year)
- Monthly data: 12-period MA (1 year)
- Daily data: 252-period MA (1 year)

These are stored as separate columns in the database (e.g., `Value_MA4`, `Value_MA12`, `Value_MA252`).

## Data Import

To import new FRED data:

1. Download CSV from FRED
2. Place in `data/economic/` directory
3. Run conversion: `npx tsx scripts/convert-fred-economic.ts`
4. Import to database: `npx tsx scripts/import-data.ts`
5. Add rolling averages: `npx tsx scripts/add-rolling-averages-quarterly.ts` (for quarterly data)

## Chart Compatibility

The charts automatically handle different data frequencies. Quarterly data will show fewer data points but will be plotted correctly on the timeline alongside monthly and daily data.
