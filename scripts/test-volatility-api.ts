import { dbService } from '../lib/db-service';

async function testVolatilityAPI() {
    console.log('Testing volatility data access...\n');

    // Test loading volatility columns for S&P 500
    const data = dbService.loadSeries(
        'equities',
        'US/GSPC',
        ['Value_Vol63', 'Value_Vol126', 'Value_Vol252']
    );

    console.log(`Loaded ${data.data.length} data points`);
    console.log(`Columns: ${data.columns.join(', ')}`);

    // Show last 5 data points
    console.log('\nLast 5 data points:');
    const last5 = data.data.slice(-5);
    for (const point of last5) {
        const date = new Date(point.date).toISOString().split('T')[0];
        console.log(`${date}:`);
        console.log(`  63-day:  ${point.Value_Vol63?.toFixed(2)}%`);
        console.log(`  126-day: ${point.Value_Vol126?.toFixed(2)}%`);
        console.log(`  252-day: ${point.Value_Vol252?.toFixed(2)}%`);
    }

    // Calculate some stats
    const vol252Values = data.data
        .map(d => d.Value_Vol252)
        .filter((v): v is number => v !== undefined && v !== null);

    if (vol252Values.length > 0) {
        const avg = vol252Values.reduce((a, b) => a + b, 0) / vol252Values.length;
        const max = Math.max(...vol252Values);
        const min = Math.min(...vol252Values);
        const latest = vol252Values[vol252Values.length - 1];

        console.log('\n252-day volatility statistics:');
        console.log(`  Latest: ${latest.toFixed(2)}%`);
        console.log(`  Average: ${avg.toFixed(2)}%`);
        console.log(`  Min: ${min.toFixed(2)}%`);
        console.log(`  Max: ${max.toFixed(2)}%`);
    }

    console.log('\n✅ Test complete!');
}

testVolatilityAPI().catch(console.error);
