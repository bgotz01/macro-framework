import Database from 'better-sqlite3';
import path from 'path';

function createDerivedPercentiles() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating derived metric percentiles...\n');

        // 1. Real Yield (10Y - CPI)
        console.log('1. Calculating Real Yield (10Y - CPI)...');
        const realYieldQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as tnx_value,
                    pa2.value as cpi_value,
                    pa1.value - pa2.value as real_yield
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'bonds'
                  AND pa1.series_name = 'US/TNX-Monthly'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    real_yield as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.real_yield < c1.real_yield
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const realYieldResults = db.prepare(realYieldQuery).all() as any[];
        console.log(`  Found ${realYieldResults.length} data points`);

        // Delete existing
        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Yield'`).run();

        // Insert
        const insertRealYield = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Yield', 'Value', ?, ?)
        `);

        const insertManyRealYield = db.transaction((data: any[]) => {
            for (const row of data) {
                insertRealYield.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyRealYield(realYieldResults);
        console.log(`  ✅ Inserted ${realYieldResults.length} Real Yield percentiles\n`);

        // 2. Yield Curve (10Y - 2Y)
        console.log('2. Calculating Yield Curve (10Y - 2Y)...');
        const yieldCurveQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as tnx_value,
                    pa2.value as us2yr_value,
                    pa1.value - pa2.value as yield_curve
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'bonds'
                  AND pa1.series_name = 'US/TNX-Monthly'
                  AND pa2.asset_class = 'bonds'
                  AND pa2.series_name = 'US/US-2yr-Monthly'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    yield_curve as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.yield_curve < c1.yield_curve
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const yieldCurveResults = db.prepare(yieldCurveQuery).all() as any[];
        console.log(`  Found ${yieldCurveResults.length} data points`);

        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Yield-Curve'`).run();

        const insertYieldCurve = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Yield-Curve', 'Value', ?, ?)
        `);

        const insertManyYieldCurve = db.transaction((data: any[]) => {
            for (const row of data) {
                insertYieldCurve.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyYieldCurve(yieldCurveResults);
        console.log(`  ✅ Inserted ${yieldCurveResults.length} Yield Curve percentiles\n`);

        // 2b. Yield Curve 10Y-3M (10Y - 3M)
        console.log('2b. Calculating Yield Curve 10Y-3M (10Y - 3M)...');
        const yieldCurve3MQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as tnx_value,
                    pa2.value as irx_value,
                    pa1.value - pa2.value as yield_curve_3m
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'bonds'
                  AND pa1.series_name = 'US/TNX-Monthly'
                  AND pa2.asset_class = 'bonds'
                  AND pa2.series_name = 'US/IRX-Monthly'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    yield_curve_3m as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.yield_curve_3m < c1.yield_curve_3m
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const yieldCurve3MResults = db.prepare(yieldCurve3MQuery).all() as any[];
        console.log(`  Found ${yieldCurve3MResults.length} data points`);

        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Yield-Curve-10Y-3M'`).run();

        const insertYieldCurve3M = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Yield-Curve-10Y-3M', 'Value', ?, ?)
        `);

        const insertManyYieldCurve3M = db.transaction((data: any[]) => {
            for (const row of data) {
                insertYieldCurve3M.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyYieldCurve3M(yieldCurve3MResults);
        console.log(`  ✅ Inserted ${yieldCurve3MResults.length} Yield Curve 10Y-3M percentiles\n`);

        // 3. Earnings Yield Premium (E/P - 3M)
        console.log('3. Calculating Earnings Yield Premium (E/P - 3M)...');
        const eypQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as pe_value,
                    pa2.value as irx_value,
                    (100.0 / pa1.value) - pa2.value as eyp
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'valuations'
                  AND pa1.series_name = 'Shiller-PE'
                  AND pa2.asset_class = 'bonds'
                  AND pa2.series_name = 'US/IRX-Monthly'
                  AND pa1.value IS NOT NULL
                  AND pa1.value > 0
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    eyp as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.eyp < c1.eyp
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const eypResults = db.prepare(eypQuery).all() as any[];
        console.log(`  Found ${eypResults.length} data points`);

        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Earnings-Yield-Premium'`).run();

        const insertEYP = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Earnings-Yield-Premium', 'Value', ?, ?)
        `);

        const insertManyEYP = db.transaction((data: any[]) => {
            for (const row of data) {
                insertEYP.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyEYP(eypResults);
        console.log(`  ✅ Inserted ${eypResults.length} Earnings Yield Premium percentiles\n`);

        // 3b. Earnings Yield Premium 5yr (1/PE-5yr - 3M)
        console.log('3b. Calculating Earnings Yield Premium 5yr (1/PE-5yr - 3M)...');
        const eyp5yrQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as pe5yr_value,
                    pa2.value as irx_value,
                    (100.0 / pa1.value) - pa2.value as eyp5yr
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'valuations'
                  AND pa1.series_name = 'PE-5yr'
                  AND pa2.asset_class = 'bonds'
                  AND pa2.series_name = 'US/IRX-Monthly'
                  AND pa1.value IS NOT NULL
                  AND pa1.value > 0
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    eyp5yr as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.eyp5yr < c1.eyp5yr
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const eyp5yrResults = db.prepare(eyp5yrQuery).all() as any[];
        console.log(`  Found ${eyp5yrResults.length} data points`);

        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Earnings-Yield-Premium-5yr'`).run();

        const insertEYP5yr = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Earnings-Yield-Premium-5yr', 'Value', ?, ?)
        `);

        const insertManyEYP5yr = db.transaction((data: any[]) => {
            for (const row of data) {
                insertEYP5yr.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyEYP5yr(eyp5yrResults);
        console.log(`  ✅ Inserted ${eyp5yrResults.length} Earnings Yield Premium 5yr percentiles\n`);

        // 4. Real Earnings Yield (E/P - CPI)
        console.log('4. Calculating Real Earnings Yield (E/P - CPI)...');
        const reyQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as pe_value,
                    pa2.value as cpi_value,
                    (100.0 / pa1.value) - pa2.value as rey
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON pa1.date = pa2.date
                WHERE pa1.asset_class = 'valuations'
                  AND pa1.series_name = 'Shiller-PE'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa1.value IS NOT NULL
                  AND pa1.value > 0
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    rey as value,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                          AND c2.rey < c1.rey
                    ) as rank_below,
                    (
                        SELECT COUNT(*)
                        FROM combined c2
                        WHERE c2.date <= c1.date
                    ) as total_count
                FROM combined c1
            )
            SELECT 
                date,
                value,
                ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const reyResults = db.prepare(reyQuery).all() as any[];
        console.log(`  Found ${reyResults.length} data points`);

        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Earnings-Yield'`).run();

        const insertREY = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Earnings-Yield', 'Value', ?, ?)
        `);

        const insertManyREY = db.transaction((data: any[]) => {
            for (const row of data) {
                insertREY.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyREY(reyResults);
        console.log(`  ✅ Inserted ${reyResults.length} Real Earnings Yield percentiles\n`);

        console.log('✅ All derived metric percentiles created!\n');

        // Summary
        console.log('📈 Summary:');
        const summary = db.prepare(`
            SELECT 
                series_name,
                COUNT(*) as total_records,
                ROUND(MIN(percentile_rank), 2) as min_pct,
                ROUND(MAX(percentile_rank), 2) as max_pct,
                ROUND(AVG(percentile_rank), 2) as avg_pct
            FROM percentile_analysis
            WHERE asset_class = 'derived'
            GROUP BY series_name
        `).all() as any[];

        summary.forEach(row => {
            console.log(`  ${row.series_name}:`);
            console.log(`    Records: ${row.total_records}`);
            console.log(`    Percentile range: ${row.min_pct} - ${row.max_pct}`);
            console.log(`    Average percentile: ${row.avg_pct}`);
        });

    } catch (error) {
        console.error('❌ Error creating derived percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createDerivedPercentiles();
