#!/bin/bash
# Economic data update pipeline
# Run after downloading fresh CSVs from FRED into data/economic/US/
set -e

echo ""
echo "========================================="
echo "  ECONOMIC DATA UPDATE PIPELINE"
echo "========================================="
echo ""

echo "--- Step 1: Convert CPIAUCSL → CPINominal.csv ---"
npx tsx scripts/convert-cpiaucsl.ts

echo ""
echo "--- Step 2: Import all economic CSVs into DB ---"
npx tsx scripts/import-data-incremental.ts

echo ""
echo "--- Step 3: Import FRED series (money markets, debt, etc.) ---"
npx tsx scripts/import-new-economic-data.ts

echo ""
echo "--- Step 4: Recalculate CPI YoY % ---"
npx tsx scripts/calculate-cpi-yoy.ts

echo ""
echo "--- Step 5: Recalculate M1/M2 YoY & Real M2 ---"
npx tsx scripts/add-m1-m2-money-supply.ts

echo ""
echo "--- Step 6: Recalculate monthly rolling averages ---"
npx tsx scripts/calculate-monthly-averages-incremental.ts

echo ""
echo "--- Step 7: Recalculate percentiles ---"
npx tsx scripts/calculate-percentiles.ts

echo ""
echo "========================================="
echo "  ✅ Economic data update complete!"
echo "========================================="
echo ""
