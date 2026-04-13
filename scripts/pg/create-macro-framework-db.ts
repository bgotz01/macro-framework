#!/usr/bin/env tsx
/**
 * Populates the `macro-framework` Postgres DB from `stockdata`.
 *
 * Tables must already exist (run: npx prisma migrate deploy --schema=prisma/schema.macro.prisma)
 *
 * Copies only what cockpit + regime-active need:
 *
 * macro_time_series (filtered):
 *   - equities:   US/GSPC only
 *   - bonds:      monthly series + last 90 days of daily US/TNX & US/IRX
 *   - derived:    all SP500-* series + Real-10Y, Real-3M, Yield-Curve*, EYP*, REY*
 *   - valuations: SP500-Price, SP500-EPS*, PE-*, Earnings-Yield-*, Shiller-PE
 *   - economic:   CPI, CPINominal, M2SL, M2-YoY, Real-M2-YoY, US/FEDFUNDS
 *
 * macro_percentile_analysis (filtered):
 *   - All regime-relevant series (drops DJI, daily bonds, global indices)
 *
 * macro_regime_timeline:  full copy
 * macro_series_metadata:  full copy
 *
 * Run:
 *   npx tsx scripts/pg/create-macro-framework-db.ts
 */

import { Client } from 'pg';

const SOURCE_URL = 'postgresql://borisgotzev:koinare@localhost:5432/stockdata';
const TARGET_URL = 'postgresql://borisgotzev:koinare@localhost:5432/macro-framework';

// ── Filters ──────────────────────────────────────────────────────────────────

const TIME_SERIES_WHERE = `
  (asset_class = 'equities' AND series_name = 'US/GSPC')
  OR (asset_class = 'bonds' AND series_name LIKE '%-Monthly')
  OR (asset_class = 'bonds' AND series_name IN ('US/TNX', 'US/IRX') AND date::date >= CURRENT_DATE - INTERVAL '90 days')
  OR (asset_class = 'derived' AND series_name LIKE 'SP500-%')
  OR (asset_class = 'derived' AND series_name IN (
    'Real-10Y', 'Real-3M',
    'Yield-Curve', 'Yield-Curve-10Y-3M',
    'Earnings-Yield-Premium', 'Earnings-Yield-Premium-2yr', 'Earnings-Yield-Premium-5yr',
    'Real-Earnings-Yield', 'Real-Earnings-Yield-2yr', 'Real-Earnings-Yield-5yr',
    'SP500-EPS-YoY', 'SP500SPS-YoY'
  ))
  OR (asset_class = 'valuations' AND series_name IN (
    'SP500-Price',
    'SP500-EPS', 'SP500-EPS-2yr', 'SP500-EPS-5yr', 'SP500-EPS-10yr', 'SP500-EPS-Quarterly',
    'PE-1yr', 'PE-2yr', 'PE-5yr',
    'Earnings-Yield', 'Earnings-Yield-2yr', 'Earnings-Yield-5yr',
    'Shiller-PE', 'SP500-PE', 'SP500-PE-10yr', 'SP500-PS', 'SP500SPS'
  ))
  OR (asset_class = 'economic' AND series_name IN (
    'CPI', 'CPINominal', 'M2SL', 'M2-YoY', 'Real-M2-YoY', 'US/FEDFUNDS'
  ))
`;

const PERCENTILE_SERIES = [
    'Real-10Y', 'Real-3M',
    'Real-Earnings-Yield-5yr', 'Real-Earnings-Yield-2yr', 'Real-Earnings-Yield',
    'Earnings-Yield-Premium-5yr', 'Earnings-Yield-Premium-2yr', 'Earnings-Yield-Premium',
    'Yield-Curve', 'Yield-Curve-10Y-3M',
    'Real-EYP-5yr',
    'CPI', 'M2-YoY', 'Real-M2-YoY', 'US/FEDFUNDS',
    'US/IRX-Monthly', 'US/TNX-Monthly', 'US/US-2yr-Monthly',
    'SP500-MA50', 'SP500-MA200', 'SP500-MA500',
    'SP500-50MA-Div', 'SP500-50MA-Slope', 'SP500-50MA-SlopeStreak', 'SP500-50MA-PriceAboveStreak',
    'SP500-200MA-Div', 'SP500-200MA-Slope', 'SP500-200MA-SlopeStreak', 'SP500-200MA-PriceAboveStreak',
    'SP500-500MA-Div', 'SP500-500MA-Slope', 'SP500-500MA-SlopeStreak', 'SP500-500MA-PriceAboveStreak',
    'PE-5yr', 'PE-2yr', 'PE-1yr',
    'Earnings-Yield-5yr', 'Earnings-Yield-2yr', 'Earnings-Yield',
    'Shiller-PE', 'US/GSPC',
];

// ── Copy helper ───────────────────────────────────────────────────────────────

async function copyTable(
    src: Client,
    dst: Client,
    table: string,
    whereClause: string,
    label: string,
) {
    const w = whereClause ? ` WHERE ${whereClause}` : '';

    const countRes = await src.query(`SELECT COUNT(*) FROM ${table}${w}`);
    const total = parseInt(countRes.rows[0].count);
    process.stdout.write(`  ${label.padEnd(40)} ${total.toLocaleString()} rows — copying...`);

    if (total === 0) {
        console.log(' (empty, skipped)');
        return;
    }

    // Get columns from source
    const colRes = await src.query(
        `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND table_schema = 'public'
     ORDER BY ordinal_position`,
        [table],
    );
    const cols: string[] = colRes.rows.map((r: { column_name: string }) => r.column_name);
    const colList = cols.map(c => `"${c}"`).join(', ');

    const BATCH = 5_000;
    let offset = 0;
    let copied = 0;

    while (offset < total) {
        const res = await src.query(
            `SELECT ${colList} FROM ${table}${w} ORDER BY 1 LIMIT ${BATCH} OFFSET ${offset}`,
        );
        if (res.rows.length === 0) break;

        // Build parameterised multi-row insert
        const values: unknown[] = [];
        const rowPlaceholders: string[] = [];

        res.rows.forEach((row: Record<string, unknown>, i: number) => {
            const base = i * cols.length;
            rowPlaceholders.push(
                `(${cols.map((_, j) => `$${base + j + 1}`).join(', ')})`,
            );
            cols.forEach(c => values.push(row[c]));
        });

        await dst.query(
            `INSERT INTO ${table} (${colList}) VALUES ${rowPlaceholders.join(', ')} ON CONFLICT DO NOTHING`,
            values,
        );

        copied += res.rows.length;
        offset += BATCH;
        process.stdout.write(`\r  ${label.padEnd(40)} ${copied.toLocaleString()} / ${total.toLocaleString()}   `);
    }

    console.log(`\r  ${label.padEnd(40)} ✓ ${copied.toLocaleString()} rows`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const src = new Client({ connectionString: SOURCE_URL });
    const dst = new Client({ connectionString: TARGET_URL });

    await src.connect();
    await dst.connect();
    console.log('Connected ✓  stockdata → macro-framework\n');

    const seriesIn = PERCENTILE_SERIES.map(s => `'${s}'`).join(', ');

    await copyTable(src, dst, 'macro_time_series', TIME_SERIES_WHERE.trim(), 'macro_time_series');
    await copyTable(src, dst, 'macro_percentile_analysis', `series_name IN (${seriesIn})`, 'macro_percentile_analysis');
    await copyTable(src, dst, 'macro_regime_timeline', '', 'macro_regime_timeline');
    await copyTable(src, dst, 'macro_series_metadata', '', 'macro_series_metadata');

    // Size report
    console.log('\nSize report:');
    const sizeRes = await dst.query(`
    SELECT relname AS t,
           pg_size_pretty(pg_total_relation_size(relid)) AS size,
           pg_total_relation_size(relid) AS bytes
    FROM pg_catalog.pg_statio_user_tables
    ORDER BY bytes DESC
  `);
    let total = 0;
    for (const row of sizeRes.rows) {
        console.log(`  ${row.t.padEnd(35)} ${row.size}`);
        total += parseInt(row.bytes);
    }
    console.log(`\n  Total: ${(total / 1024 / 1024).toFixed(0)} MB`);

    await src.end();
    await dst.end();
    console.log('\nDone ✓');
}

main().catch(err => { console.error(err); process.exit(1); });
