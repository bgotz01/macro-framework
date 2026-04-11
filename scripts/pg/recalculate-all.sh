#!/bin/bash
# One-time full recalculation of all derived series and percentiles.
# Use this when source data has been revised (e.g. new CPI source).
# After running this once, use update-all.sh for incremental updates.

set -e

echo "⚠️  Full recalculation mode — this will recompute all derived series and percentiles."
echo ""

echo "Step 1: Recalculating derived series (Real Yields, Yield Curves, EYP, REY)..."
npx tsx scripts/pg/calculate-derived-series.ts --force

echo ""
echo "Step 2: Recalculating all percentiles..."
npx tsx scripts/pg/calculate-percentiles.ts --force

echo ""
echo "✅ Full recalculation complete. Use update-all.sh for future incremental updates."
