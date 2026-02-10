import { PercentileService } from '../lib/percentile-service';

console.log('Testing Percentile Service...\n');

// Test 1: Get available years
console.log('1. Available Years:');
const years = PercentileService.getAvailableYears();
console.log(`   Found ${years.length} years: ${years[0]} to ${years[years.length - 1]}`);

// Test 2: Get year-end data for interesting years
const testYears = [1980, 2008, 2020, 2022, 2025];

console.log('\n2. Year-End Percentiles:\n');

for (const year of testYears) {
    console.log(`   === ${year} ===`);

    const cpi = PercentileService.getYearEndPercentile('economic', 'CPI', year);
    const fedFunds = PercentileService.getYearEndPercentile('economic', 'US/FEDFUNDS', year);

    if (cpi) {
        console.log(`   CPI: ${cpi.value.toFixed(2)}% at ${cpi.percentileRank.toFixed(1)}th percentile (${cpi.dateStr})`);
    } else {
        console.log(`   CPI: No data`);
    }

    if (fedFunds) {
        console.log(`   Fed Funds: ${fedFunds.value.toFixed(2)}% at ${fedFunds.percentileRank.toFixed(1)}th percentile (${fedFunds.dateStr})`);
    } else {
        console.log(`   Fed Funds: No data`);
    }

    console.log('');
}

// Test 3: Get historical extremes
console.log('3. Historical Extremes:\n');

const cpiExtremes = PercentileService.getHistoricalExtremes('economic', 'CPI');
console.log('   CPI:');
console.log(`     Highest: ${cpiExtremes.highest?.value.toFixed(2)}% on ${cpiExtremes.highest?.dateStr}`);
console.log(`     Lowest: ${cpiExtremes.lowest?.value.toFixed(2)}% on ${cpiExtremes.lowest?.dateStr}`);

const fedFundsExtremes = PercentileService.getHistoricalExtremes('economic', 'US/FEDFUNDS');
console.log('\n   Fed Funds:');
console.log(`     Highest: ${fedFundsExtremes.highest?.value.toFixed(2)}% on ${fedFundsExtremes.highest?.dateStr}`);
console.log(`     Lowest: ${fedFundsExtremes.lowest?.value.toFixed(2)}% on ${fedFundsExtremes.lowest?.dateStr}`);

console.log('\n✅ All tests completed!');
