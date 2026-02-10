import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath, { readonly: true });

console.log('📊 Testing All Percentile Data\n');

// Get latest values for all series
const series = [
    { asset_class: 'economic', series_name: 'CPI', label: 'CPI Inflation' },
    { asset_class: 'economic', series_name: 'US/FEDFUNDS', label: 'Fed Funds Rate' },
    { asset_class: 'bonds', series_name: 'US/TNX-Monthly', label: '10Y Treasury' },
    { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', label: '2Y Treasury' },
    { asset_class: 'bonds', series_name: 'US/IRX-Monthly', label: '3M Treasury' },
    { asset_class: 'valuations', series_name: 'Shiller-PE', label: 'Shiller P/E' },
    { asset_class: 'derived', series_name: 'Real-Yield', label: 'Real Yield' },
    { asset_class: 'derived', series_name: 'Yield-Curve', label: 'Yield Curve' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium', label: 'Earnings Yield Premium' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield', label: 'Real Earnings Yield' },
];

console.log('Latest Values:\n');

for (const s of series) {
    const query = `
        SELECT date, value, percentile_rank
        FROM percentile_analysis
        WHERE asset_class = ? AND series_name = ?
        ORDER BY date DESC
        LIMIT 1
    `;

    const result = db.prepare(query).get(s.asset_class, s.series_name) as any;

    if (result) {
        const dateStr = new Date(result.date).toISOString().split('T')[0];
        console.log(`${s.label}:`);
        console.log(`  Date: ${dateStr}`);
        console.log(`  Value: ${result.value.toFixed(2)}`);
        console.log(`  Percentile: ${result.percentile_rank.toFixed(1)}th`);
        console.log('');
    } else {
        console.log(`${s.label}: No data`);
        console.log('');
    }
}

db.close();

console.log('✅ Test complete!');
