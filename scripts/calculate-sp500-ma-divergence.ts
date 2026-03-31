import Database from 'better-sqlite3';
import path from 'path';

interface PriceRow {
    date: string;
    price: number;
    ma50: number;
    ma200: number;
    ma500: number;
}

function main() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('Starting incremental SP500 MA divergence calculation...');

    // Find the latest date already computed (use 200MA-Div as reference)
    const latestRow = db.prepare(`
        SELECT MAX(date) as max_date FROM time_series
        WHERE asset_class = 'derived' AND series_name = 'SP500-200MA-Div'
    `).get() as { max_date: string | null };

    const latestComputed = latestRow?.max_date;

    // Build query — full history if no prior data, otherwise only new dates
    let whereClause = '';
    const params: string[] = [];
    if (latestComputed) {
        whereClause = 'AND p.date > ?';
        params.push(latestComputed);
        console.log(`Incremental: processing dates after ${latestComputed}`);
    } else {
        console.log('Full run: no existing data');
    }

    const data = db.prepare(`
        SELECT 
            p.date,
            p.value as price,
            ma50.value as ma50,
            ma200.value as ma200,
            ma500.value as ma500
        FROM time_series p
        LEFT JOIN time_series ma50 ON p.date = ma50.date AND ma50.asset_class = 'derived' AND ma50.series_name = 'SP500-MA50' AND ma50.column_name = 'value'
        LEFT JOIN time_series ma200 ON p.date = ma200.date AND ma200.asset_class = 'derived' AND ma200.series_name = 'SP500-MA200' AND ma200.column_name = 'value'
        LEFT JOIN time_series ma500 ON p.date = ma500.date AND ma500.asset_class = 'derived' AND ma500.series_name = 'SP500-MA500' AND ma500.column_name = 'value'
        WHERE p.asset_class = 'equities' 
        AND p.series_name = 'US/GSPC'
        AND p.column_name = 'Value'
        ${whereClause}
        ORDER BY p.date ASC
    `).all(...params) as PriceRow[];

    if (data.length === 0) {
        console.log('✓ Already up to date');
        db.close();
        return;
    }

    console.log(`Found ${data.length} new price records to process`);

    // Calculate divergences
    const divergences = data.map(row => {
        if (!row.price) return null;
        return {
            date: row.date,
            div50: row.ma50 ? ((row.price - row.ma50) / row.ma50) * 100 : null,
            div200: row.ma200 ? ((row.price - row.ma200) / row.ma200) * 100 : null,
            div500: row.ma500 ? ((row.price - row.ma500) / row.ma500) * 100 : null
        };
    }).filter(d => d !== null);

    console.log(`Calculated ${divergences.length} divergence records`);

    const insertTimeSeries = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const insertPercentile = db.prepare(`
        INSERT OR REPLACE INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
        VALUES (?, ?, ?, ?, ?, NULL)
    `);

    const inserted = db.transaction(() => {
        let count = 0;
        for (const d of divergences) {
            if (d.div50 !== null) {
                insertTimeSeries.run(d.date, 'derived', 'SP500-50MA-Div', 'value', d.div50);
                insertPercentile.run(d.date, 'derived', 'SP500-50MA-Div', 'value', d.div50);
                count++;
            }
            if (d.div200 !== null) {
                insertTimeSeries.run(d.date, 'derived', 'SP500-200MA-Div', 'value', d.div200);
                insertPercentile.run(d.date, 'derived', 'SP500-200MA-Div', 'value', d.div200);
                count++;
            }
            if (d.div500 !== null) {
                insertTimeSeries.run(d.date, 'derived', 'SP500-500MA-Div', 'value', d.div500);
                insertPercentile.run(d.date, 'derived', 'SP500-500MA-Div', 'value', d.div500);
                count++;
            }
        }
        return count;
    })();

    // Update metadata
    const upsertMetadata = db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, source, last_updated, units)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const now = Math.floor(Date.now() / 1000);

    upsertMetadata.run('derived', 'SP500-50MA-Div', 'S&P 500 50MA Divergence', 'Price divergence from 50-day moving average as percentage', 'Calculated from SP500-Price and SP500-MA50', now, '%');
    upsertMetadata.run('derived', 'SP500-200MA-Div', 'S&P 500 200MA Divergence', 'Price divergence from 200-day moving average as percentage', 'Calculated from SP500-Price and SP500-MA200', now, '%');
    upsertMetadata.run('derived', 'SP500-500MA-Div', 'S&P 500 500MA Divergence', 'Price divergence from 500-day moving average as percentage', 'Calculated from SP500-Price and SP500-MA500', now, '%');

    console.log(`✓ Inserted ${inserted} divergence values`);

    db.close();
    console.log('Done!');
}

main();
