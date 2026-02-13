#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface AnalyticsOptions {
    analysis?: string;
}

function runAnalytics(options: AnalyticsOptions = {}) {
    const db = new Database(DB_PATH, { readonly: true });

    console.log('\n🔍 S&P 500 Analytics\n');
    console.log('━'.repeat(60));

    // 1. Current composition by sector
    if (!options.analysis || options.analysis === 'sectors') {
        console.log('\n📊 Current Composition by Sector:\n');
        const sectors = db.prepare(`
      SELECT 
        gics_sector,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) as percentage
      FROM sp500_constituents
      WHERE gics_sector IS NOT NULL
      GROUP BY gics_sector
      ORDER BY count DESC
    `).all() as Array<{ gics_sector: string; count: number; percentage: number }>;

        sectors.forEach(({ gics_sector, count, percentage }) => {
            const bar = '█'.repeat(Math.round(percentage / 2));
            console.log(`${gics_sector.padEnd(30)} ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
        });
    }

    // 2. Turnover analysis - companies added/removed by year
    if (!options.analysis || options.analysis === 'turnover') {
        console.log('\n\n📈 Annual Turnover (Additions/Removals):\n');
        const turnover = db.prepare(`
      SELECT 
        SUBSTR(date, -2) || '-' || SUBSTR(date, 4, 3) as year_month,
        COUNT(CASE WHEN added_ticker IS NOT NULL THEN 1 END) as additions,
        COUNT(CASE WHEN removed_ticker IS NOT NULL THEN 1 END) as removals
      FROM sp500_changes
      WHERE date IS NOT NULL
      GROUP BY SUBSTR(date, -2)
      ORDER BY SUBSTR(date, -2) DESC
      LIMIT 15
    `).all() as Array<{ year_month: string; additions: number; removals: number }>;

        console.log('Year    Additions  Removals');
        console.log('─'.repeat(30));
        turnover.forEach(({ year_month, additions, removals }) => {
            console.log(`${year_month}      ${additions.toString().padStart(3)}        ${removals.toString().padStart(3)}`);
        });
    }

    // 3. Most common removal reasons
    if (!options.analysis || options.analysis === 'reasons') {
        console.log('\n\n🔄 Top Removal Reasons:\n');
        const reasons = db.prepare(`
      SELECT 
        CASE 
          WHEN reason LIKE '%acquired%' OR reason LIKE '%Acquired%' THEN 'Acquisition'
          WHEN reason LIKE '%Market cap%' OR reason LIKE '%market cap%' THEN 'Market Cap Change'
          WHEN reason LIKE '%spun off%' OR reason LIKE '%spin%' THEN 'Spin-off'
          WHEN reason LIKE '%merged%' OR reason LIKE '%merge%' THEN 'Merger'
          WHEN reason LIKE '%bankruptcy%' THEN 'Bankruptcy'
          ELSE 'Other'
        END as reason_category,
        COUNT(*) as count
      FROM sp500_changes
      WHERE removed_ticker IS NOT NULL AND reason IS NOT NULL
      GROUP BY reason_category
      ORDER BY count DESC
    `).all() as Array<{ reason_category: string; count: number }>;

        reasons.forEach(({ reason_category, count }) => {
            const bar = '▓'.repeat(Math.round(count / 5));
            console.log(`${reason_category.padEnd(20)} ${count.toString().padStart(3)} ${bar}`);
        });
    }

    // 4. Longest tenured companies
    if (!options.analysis || options.analysis === 'tenure') {
        console.log('\n\n⏰ Longest Tenured Companies (Original 1957 Members):\n');
        const longTenured = db.prepare(`
      SELECT symbol, security, gics_sector, date_added
      FROM sp500_constituents
      WHERE date_added = '1957-03-04'
      ORDER BY security
      LIMIT 20
    `).all() as Array<{ symbol: string; security: string; gics_sector: string; date_added: string }>;

        longTenured.forEach(({ symbol, security, gics_sector }) => {
            console.log(`${symbol.padEnd(6)} ${security.padEnd(40)} ${gics_sector}`);
        });

        const totalOriginal = db.prepare(`
      SELECT COUNT(*) as count FROM sp500_constituents WHERE date_added = '1957-03-04'
    `).get() as { count: number };

        console.log(`\n   Total original 1957 members still in index: ${totalOriginal.count}`);
    }

    // 5. Recent changes (last 12 months)
    if (!options.analysis || options.analysis === 'recent') {
        console.log('\n\n🆕 Recent Changes (2025-2026):\n');
        const recent = db.prepare(`
      SELECT date, added_ticker, added_company, removed_ticker, removed_company, reason
      FROM sp500_changes
      WHERE date LIKE '%25' OR date LIKE '%26'
      ORDER BY date DESC
      LIMIT 15
    `).all() as Array<{
            date: string;
            added_ticker: string;
            added_company: string;
            removed_ticker: string;
            removed_company: string;
            reason: string;
        }>;

        recent.forEach(({ date, added_ticker, added_company, removed_ticker, removed_company, reason }) => {
            console.log(`\n${date}:`);
            if (added_ticker) {
                console.log(`  ➕ Added: ${added_ticker} (${added_company})`);
            }
            if (removed_ticker) {
                console.log(`  ➖ Removed: ${removed_ticker} (${removed_company})`);
            }
            console.log(`  📝 ${reason}`);
        });
    }

    // 6. Sector concentration over time
    if (!options.analysis || options.analysis === 'concentration') {
        console.log('\n\n🎯 Top 10 Sub-Industries by Company Count:\n');
        const subIndustries = db.prepare(`
      SELECT 
        gics_sub_industry,
        COUNT(*) as count,
        GROUP_CONCAT(symbol, ', ') as symbols
      FROM sp500_constituents
      WHERE gics_sub_industry IS NOT NULL
      GROUP BY gics_sub_industry
      ORDER BY count DESC
      LIMIT 10
    `).all() as Array<{ gics_sub_industry: string; count: number; symbols: string }>;

        subIndustries.forEach(({ gics_sub_industry, count, symbols }, idx) => {
            console.log(`\n${(idx + 1).toString().padStart(2)}. ${gics_sub_industry} (${count} companies)`);
            const symbolList = symbols.split(', ').slice(0, 10).join(', ');
            console.log(`    ${symbolList}${symbols.split(', ').length > 10 ? '...' : ''}`);
        });
    }

    console.log('\n' + '━'.repeat(60) + '\n');
    db.close();
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: AnalyticsOptions = {};

if (args.length > 0) {
    options.analysis = args[0];
}

runAnalytics(options);
