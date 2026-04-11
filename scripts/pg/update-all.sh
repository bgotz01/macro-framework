#!/bin/bash
set -e

echo "🚀 Starting full data update pipeline (Postgres)..."
echo "========================================"

echo ""
echo "Step 1/9: Fetching latest data from Yahoo Finance..."
python scripts/batch_update_all.py

echo ""
echo "Step 2/9: Importing new data into Postgres..."
npx tsx scripts/pg/import-data-incremental.ts

echo ""
echo "Step 3/9: Calculating cyclical returns (2Y, 5Y, 10Y)..."
npx tsx scripts/pg/add-cyclical-returns.ts

echo ""
echo "Step 4/9: Calculating volatility metrics (63d, 126d, 252d, 504d)..."
npx tsx scripts/pg/add-volatility-metrics.ts

echo ""
echo "Step 5/9: Calculating monthly bond yields..."
npx tsx scripts/pg/calculate-monthly-bond-yields.ts

echo ""
echo "Step 5b: Calculating derived series (Real Yields, Yield Curves, EYP, REY)..."
npx tsx scripts/pg/calculate-derived-series.ts

echo ""
echo "Step 6/9: Recalculating percentiles..."
npx tsx scripts/pg/calculate-percentiles.ts

echo ""
echo "Step 6/9: Importing economic data..."
npx tsx scripts/pg/import-economic-data.ts

echo ""
echo "Step 7/9: Calculating S&P 500 moving averages..."
npx tsx scripts/pg/calculate-sp500-moving-averages.ts

echo ""
echo "Step 8/9: Calculating MA divergence, slope & stats..."
npx tsx scripts/pg/calculate-sp500-ma-divergence.ts
npx tsx scripts/pg/calculate-sp500-ma-slope.ts
npx tsx scripts/pg/calculate-sp500-ma-stats.ts

echo ""
echo "Step 9/9: Calculating MA percentiles..."
npx tsx scripts/pg/calculate-ma-percentiles.ts

echo ""
echo "========================================"
echo "✅ Full Postgres update pipeline complete!"
