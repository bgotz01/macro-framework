#!/bin/bash
set -e

echo "🚀 Starting full data update pipeline..."
echo "========================================"

echo ""
echo "Step 1/9: Fetching latest data from Yahoo Finance..."
python scripts/batch_update_all.py

echo ""
echo "Step 2/9: Importing new data into database..."
npx tsx scripts/import-data-incremental.ts

echo ""
echo "Step 3/9: Calculating cyclical returns (2Y, 5Y, 10Y)..."
npx tsx scripts/add-cyclical-returns.ts

echo ""
echo "Step 4/9: Calculating volatility metrics (63d, 126d, 252d, 504d)..."
npx tsx scripts/add-volatility-metrics.ts

echo ""
echo "Step 5/9: Recalculating percentiles..."
npx tsx scripts/calculate-percentiles.ts

echo ""
echo "Step 6/9: Importing economic data..."
npx tsx scripts/import-new-economic-data.ts

echo ""
echo "Step 7/9: Calculating S&P 500 moving averages..."
npx tsx scripts/calculate-sp500-moving-averages.ts

echo ""
echo "Step 8/9: Calculating MA divergence, slope & stats..."
npx tsx scripts/calculate-sp500-ma-divergence.ts
npx tsx scripts/calculate-sp500-ma-slope.ts
npx tsx scripts/calculate-sp500-ma-stats.ts

echo ""
echo "Step 9/9: Calculating MA percentiles..."
npx tsx scripts/calculate-ma-percentiles.ts

echo ""
echo "========================================"
echo "✅ Full update pipeline complete!"
