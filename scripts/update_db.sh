#!/bin/bash
# Full DB update pipeline — run after importing raw price data
set -e

echo "=== 1. Preprocess FRED CSVs ==="
npx tsx scripts/convert-cpiaucsl.ts         # CPIAUCSL.csv → CPINominal.csv (month-end dates)

echo "=== 2. Import raw price + economic data ==="
npx tsx scripts/import-data-incremental.ts
npx tsx scripts/import-new-economic-data.ts

echo "=== 3. Derived price series ==="
npx tsx scripts/create-monthly-bond-yields.ts
npx tsx scripts/create-real-yields.ts
npx tsx scripts/create-real-10y-series.ts
npx tsx scripts/create-real-3m-series.ts

echo "=== 4. Valuation metrics ==="
npx tsx scripts/calculate-sp500-moving-averages.ts
npx tsx scripts/add-rolling-sp500-eps.ts
npx tsx scripts/create-pe5yr.ts
npx tsx scripts/add-earnings-yield.ts
npx tsx scripts/add-earnings-yield-5yr.ts

echo "=== 5. Rolling averages & YoY ==="
npx tsx scripts/calculate-rolling-averages-incremental.ts
npx tsx scripts/calculate-monthly-averages-incremental.ts
npx tsx scripts/calculate-yoy-growth-incremental.ts
npx tsx scripts/calculate-cpi-yoy.ts

echo "=== 6. Cyclical returns & volatility ==="
npx tsx scripts/add-cyclical-returns.ts
npx tsx scripts/add-volatility-metrics.ts

echo "=== 7. SP500 divergence / slope ==="
npx tsx scripts/calculate-sp500-ma-divergence.ts
npx tsx scripts/calculate-sp500-ma-slope.ts

echo "=== 8. Percentiles (depends on everything above) ==="
npx tsx scripts/calculate-percentiles.ts
npx tsx scripts/calculate-real-yield-percentiles.ts

echo ""
echo "✅ DB update complete!"
