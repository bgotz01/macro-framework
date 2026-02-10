import Database from 'better-sqlite3';
import path from 'path';

console.log('📊 Decade-End Percentile Rankings\n');
console.log('Showing CPI and Fed Funds percentile ranks at the end of each decade\n');

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath, { readonly: true });

const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

console.log('Year | CPI Value | CPI %ile | Fed Funds | FF %ile | Economic Context');
console.log('-----|-----------|----------|-----------|---------|------------------');

for (const decade of decades) {
    const query = `
        SELECT 
            series_name,
            value,
            percentile_rank,
            date
        FROM percentile_analysis
        WHERE date >= strftime('%s', '${decade}-10-01') * 1000
          AND date <= strftime('%s', '${decade}-12-31 23:59:59') * 1000
        ORDER BY series_name, date DESC
        LIMIT 2
    `;

    const results = db.prepare(query).all() as any[];

    const cpi = results.find(r => r.series_name === 'CPI');
    const ff = results.find(r => r.series_name === 'US/FEDFUNDS');

    const cpiStr = cpi ? `${cpi.value.toFixed(2)}%` : 'N/A';
    const cpiPct = cpi ? `${cpi.percentile_rank.toFixed(1)}th` : 'N/A';
    const ffStr = ff ? `${ff.value.toFixed(2)}%` : 'N/A';
    const ffPct = ff ? `${ff.percentile_rank.toFixed(1)}th` : 'N/A';

    // Add context
    let context = '';
    if (decade === 1950) context = 'Post-war boom';
    if (decade === 1960) context = 'Golden age';
    if (decade === 1970) context = 'Stagflation begins';
    if (decade === 1980) context = 'Volcker peak';
    if (decade === 1990) context = 'Disinflation';
    if (decade === 2000) context = 'Dot-com bubble';
    if (decade === 2010) context = 'Post-GFC recovery';
    if (decade === 2020) context = 'Pandemic era';

    console.log(`${decade} | ${cpiStr.padEnd(9)} | ${cpiPct.padEnd(8)} | ${ffStr.padEnd(9)} | ${ffPct.padEnd(7)} | ${context}`);
}

db.close();

console.log('\n📈 Key Insights:');
console.log('• 1980s: Peak inflation and rates (Volcker era)');
console.log('• 2008-2020: Historically low inflation and rates');
console.log('• 2020s: Return to more normal percentile ranges');
