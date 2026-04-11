#!/usr/bin/env tsx
import { dbService } from '../lib/db-service';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage:');
    console.log('  tsx scripts/query-db.ts list <asset_class>');
    console.log('  tsx scripts/query-db.ts load <asset_class> <series_name>');
    console.log('  tsx scripts/query-db.ts range <asset_class> <series_name>');
    process.exit(0);
}

const command = args[0];

async function main() {
    switch (command) {
        case 'list': {
            const assetClass = args[1];
            if (!assetClass) { console.error('Error: asset_class required'); process.exit(1); }
            const series = await dbService.getSeriesByAssetClass(assetClass);
            console.log(`\nAvailable series in ${assetClass}:`);
            series.forEach(s => {
                console.log(`  ${s.series_name}`);
                console.log(`    Columns: ${s.columns.join(', ')}`);
            });
            break;
        }
        case 'load': {
            const assetClass = args[1];
            const seriesName = args[2];
            if (!assetClass || !seriesName) { console.error('Error: asset_class and series_name required'); process.exit(1); }
            const data = await dbService.loadSeries(assetClass, seriesName);
            console.log(`\nLoaded ${data.data.length} data points`);
            console.log('Columns:', data.columns);
            console.log('\nFirst 5 rows:');
            data.data.slice(0, 5).forEach(row => console.log(`  ${row.date}:`, row));
            break;
        }
        case 'range': {
            const assetClass = args[1];
            const seriesName = args[2];
            if (!assetClass || !seriesName) { console.error('Error: asset_class and series_name required'); process.exit(1); }
            const range = await dbService.getDateRange(assetClass, seriesName);
            if (range) {
                console.log(`\nDate range for ${assetClass}/${seriesName}:`);
                console.log(`  Start: ${range.min}`);
                console.log(`  End:   ${range.max}`);
                const days = Math.floor((new Date(range.max).getTime() - new Date(range.min).getTime()) / (1000 * 60 * 60 * 24));
                console.log(`  Days:  ${days}`);
            } else {
                console.log('No data found');
            }
            break;
        }
        default:
            console.error(`Unknown command: ${command}`);
            process.exit(1);
    }
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
