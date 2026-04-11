import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: string;
    value: number;
}

function calculateRollingStdDev(values: number[], window: number, annualizeFactor: number = 252, scalePercent: boolean = true): number | null {
    if (values.length < window) return null;
    const windowValues = values.slice(-window);
    const mean = windowValues.reduce((sum, val) => sum + val, 0) / window;
    const variance = windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window;
    const vol = Math.sqrt(variance) * Math.sqrt(annualizeFactor);
    return scalePercent ? vol * 100 : vol; // equities: *100 (returns are decimals), bonds: already in bps/pct
}

function processAssetClass(
    db: Database.Database,
    assetClass: string,
    options: { useAbsoluteChanges: boolean; scalePercent: boolean }
) {
    const seriesList = db.prepare(`
        SELECT DISTINCT series_name 
        FROM series_metadata 
        WHERE asset_class = ?
        ORDER BY series_name
    `).all(assetClass) as { series_name: string }[];

    // For bonds, only process the main daily series (skip monthly)
    const filtered = assetClass === 'bonds'
        ? seriesList.filter(s => !s.series_name.includes('-Monthly'))
        : seriesList;

    console.log(`Found ${filtered.length} ${assetClass} series`);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const { series_name } of filtered) {
        console.log(`\nProcessing ${assetClass}/${series_name}...`);

        const latestComputed = (db.prepare(`
            SELECT MAX(date) as max_date FROM time_series
            WHERE asset_class = ? AND series_name = ? AND column_name = 'Value_Vol63'
        `).get(assetClass, series_name) as { max_date: string | null }).max_date;

        const priceData = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
              AND value IS NOT NULL
            ORDER BY date ASC
        `).all(assetClass, series_name) as DataPoint[];

        if (priceData.length === 0) {
            console.log(`  No data found`);
            continue;
        }

        // Build daily changes array
        const changesArray: { date: string; ret: number }[] = [];
        for (let i = 1; i < priceData.length; i++) {
            const prev = priceData[i - 1].value;
            const curr = priceData[i].value;
            if (options.useAbsoluteChanges) {
                // For yields: absolute daily change in percentage points
                changesArray.push({ date: priceData[i].date, ret: curr - prev });
            } else {
                // For prices: percentage return
                if (prev > 0 && curr) {
                    changesArray.push({ date: priceData[i].date, ret: (curr - prev) / prev });
                }
            }
        }

        let fromIndex = 0;
        if (latestComputed) {
            const idx = changesArray.findIndex(r => r.date > latestComputed);
            if (idx === -1) {
                console.log(`  ✓ Already up to date`);
                continue;
            }
            fromIndex = idx;
            console.log(`  Incremental: processing ${changesArray.length - fromIndex} new rows since ${latestComputed}`);
        } else {
            console.log(`  Full run: no existing data`);
        }

        let insertCount = 0;

        const transaction = db.transaction(() => {
            for (let i = fromIndex; i < changesArray.length; i++) {
                const { date } = changesArray[i];
                const retValues = changesArray.slice(0, i + 1).map(r => r.ret);

                for (const window of [63, 126, 252, 504]) {
                    const vol = calculateRollingStdDev(retValues, window, 252, options.scalePercent);
                    if (vol !== null) {
                        insertStmt.run(date, assetClass, series_name, `Value_Vol${window}`, vol);
                        insertCount++;
                    }
                }
            }
        });

        transaction();
        console.log(`  ✓ Inserted ${insertCount} volatility data points`);
    }
}

async function addVolatilityMetrics() {
    console.log('Opening database...');
    const db = new Database(DB_PATH);

    try {
        // Equities: vol on percentage returns
        console.log('\n=== EQUITIES ===');
        processAssetClass(db, 'equities', { useAbsoluteChanges: false, scalePercent: true });

        // Bonds (treasury yields): vol on absolute yield changes (basis points)
        // Result is in percentage points of yield change, annualized
        console.log('\n=== BONDS (Treasury Yields) ===');
        processAssetClass(db, 'bonds', { useAbsoluteChanges: true, scalePercent: false });

        console.log('\n✅ Volatility metrics calculation complete!');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

addVolatilityMetrics().catch(console.error);
