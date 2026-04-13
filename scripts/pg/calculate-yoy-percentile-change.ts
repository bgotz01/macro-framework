#!/usr/bin/env tsx
/**
 * Calculates year-over-year percentile changes for all series in macro_percentile_analysis.
 * yoy_percentile_change = percentile_rank(date) - percentile_rank(same month, prior year)
 *
 * Uses a single bulk SQL UPDATE for performance.
 * Run after calculate-percentiles.ts and calculate-derived-series.ts.
 */
import { prisma } from '../../lib/prisma';

async function main() {
    const force = process.argv.includes('--force');
    if (force) console.log('⚠️  Force mode: recalculating all YoY changes\n');
    console.log('📊 Calculating YoY percentile changes in Postgres...\n');

    // Single bulk UPDATE: join each row with the row from the same series/column
    // that falls in the same month one year prior.
    const whereClause = force
        ? ''
        : 'AND a.yoy_percentile_change IS NULL';

    const result = await prisma.$executeRawUnsafe(`
        UPDATE macro_percentile_analysis a
        SET yoy_percentile_change = ROUND((a.percentile_rank - b.percentile_rank)::numeric, 2)
        FROM macro_percentile_analysis b
        WHERE a.asset_class = b.asset_class
          AND a.series_name  = b.series_name
          AND a.column_name  = b.column_name
          AND a.percentile_rank IS NOT NULL
          AND b.percentile_rank IS NOT NULL
          AND TO_CHAR(a.date::date - INTERVAL '1 year', 'YYYY-MM') = TO_CHAR(b.date::date, 'YYYY-MM')
          ${whereClause}
    `);

    console.log(`✅ Updated ${result} rows`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
