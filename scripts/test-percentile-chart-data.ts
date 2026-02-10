import { PercentileService } from '../lib/percentile-service';

console.log('Testing Percentile Chart Data...\n');

// Get full history
const cpiHistory = PercentileService.getPercentileHistory('economic', 'CPI');
const fedFundsHistory = PercentileService.getPercentileHistory('economic', 'US/FEDFUNDS');

console.log(`CPI data points: ${cpiHistory.length}`);
console.log(`Fed Funds data points: ${fedFundsHistory.length}`);

// Show sample data
console.log('\nSample CPI data (first 5):');
cpiHistory.slice(0, 5).forEach(point => {
    console.log(`  ${point.dateStr}: ${point.value.toFixed(2)}% at ${point.percentileRank.toFixed(1)}th percentile`);
});

console.log('\nSample CPI data (last 5):');
cpiHistory.slice(-5).forEach(point => {
    console.log(`  ${point.dateStr}: ${point.value.toFixed(2)}% at ${point.percentileRank.toFixed(1)}th percentile`);
});

console.log('\nSample Fed Funds data (first 5):');
fedFundsHistory.slice(0, 5).forEach(point => {
    console.log(`  ${point.dateStr}: ${point.value.toFixed(2)}% at ${point.percentileRank.toFixed(1)}th percentile`);
});

console.log('\nSample Fed Funds data (last 5):');
fedFundsHistory.slice(-5).forEach(point => {
    console.log(`  ${point.dateStr}: ${point.value.toFixed(2)}% at ${point.percentileRank.toFixed(1)}th percentile`);
});

// Merge data to simulate API response
const dataMap = new Map();

cpiHistory.forEach(point => {
    if (!dataMap.has(point.date)) {
        dataMap.set(point.date, {
            date: point.dateStr,
            dateTimestamp: point.date,
            cpi_value: point.value,
            cpi_percentile: point.percentileRank,
            fedfunds_value: null,
            fedfunds_percentile: null
        });
    }
});

fedFundsHistory.forEach(point => {
    if (!dataMap.has(point.date)) {
        dataMap.set(point.date, {
            date: point.dateStr,
            dateTimestamp: point.date,
            cpi_value: null,
            cpi_percentile: null,
            fedfunds_value: point.value,
            fedfunds_percentile: point.percentileRank
        });
    } else {
        const existing = dataMap.get(point.date);
        existing.fedfunds_value = point.value;
        existing.fedfunds_percentile = point.percentileRank;
    }
});

const mergedData = Array.from(dataMap.values())
    .sort((a, b) => a.dateTimestamp - b.dateTimestamp)
    .filter(d => d.cpi_value !== null || d.fedfunds_value !== null);

console.log(`\nMerged data points: ${mergedData.length}`);
console.log('\nSample merged data (last 5):');
mergedData.slice(-5).forEach(point => {
    console.log(`  ${point.date}:`);
    if (point.cpi_value !== null) {
        console.log(`    CPI: ${point.cpi_value.toFixed(2)}% at ${point.cpi_percentile.toFixed(1)}th percentile`);
    }
    if (point.fedfunds_value !== null) {
        console.log(`    Fed Funds: ${point.fedfunds_value.toFixed(2)}% at ${point.fedfunds_percentile.toFixed(1)}th percentile`);
    }
});

console.log('\n✅ Chart data test completed!');
