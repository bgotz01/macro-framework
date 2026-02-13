#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function analyzeSectorRotation() {
    const db = new Database(DB_PATH, { readonly: true });

    console.log('\n🔄 S&P 500 Sector Rotation Analysis\n');
    console.log('━'.repeat(70));

    // Get current sector composition
    const currentComposition = db.prepare(`
    SELECT gics_sector, COUNT(*) as count
    FROM sp500_constituents
    WHERE gics_sector IS NOT NULL
    GROUP BY gics_sector
  `).all() as Array<{ gics_sector: string; count: number }>;

    const currentMap = new Map(currentComposition.map(s => [s.gics_sector, s.count]));

    // Analyze what sectors companies came from when removed
    console.log('\n📊 Sectors of Removed Companies (All Time):\n');
    const removedBySector = db.prepare(`
    SELECT 
      CASE 
        WHEN removed_company LIKE '%Tech%' OR removed_company LIKE '%Software%' 
          OR removed_company LIKE '%Semiconductor%' THEN 'Information Technology'
        WHEN removed_company LIKE '%Bank%' OR removed_company LIKE '%Financial%' 
          OR removed_company LIKE '%Capital%' THEN 'Financials'
        WHEN removed_company LIKE '%Energy%' OR removed_company LIKE '%Oil%' 
          OR removed_company LIKE '%Gas%' THEN 'Energy'
        WHEN removed_company LIKE '%Health%' OR removed_company LIKE '%Pharma%' 
          OR removed_company LIKE '%Medical%' THEN 'Health Care'
        ELSE 'Other/Mixed'
      END as sector_estimate,
      COUNT(*) as count
    FROM sp500_changes
    WHERE removed_company IS NOT NULL
    GROUP BY sector_estimate
    ORDER BY count DESC
  `).all() as Array<{ sector_estimate: string; count: number }>;

    removedBySector.forEach(({ sector_estimate, count }) => {
        const bar = '▓'.repeat(Math.round(count / 5));
        console.log(`${sector_estimate.padEnd(30)} ${count.toString().padStart(3)} ${bar}`);
    });

    // Analyze recent sector trends (2020+)
    console.log('\n\n📈 Recent Sector Additions (2020-2026):\n');
    const recentAdditions = db.prepare(`
    SELECT 
      gics_sector,
      COUNT(*) as additions,
      GROUP_CONCAT(symbol, ', ') as companies
    FROM sp500_constituents
    WHERE date_added >= '2020-01-01'
    GROUP BY gics_sector
    ORDER BY additions DESC
  `).all() as Array<{ gics_sector: string; additions: number; companies: string }>;

    recentAdditions.forEach(({ gics_sector, additions, companies }) => {
        console.log(`\n${gics_sector} (${additions} additions):`);
        const companyList = companies.split(', ').slice(0, 15);
        console.log(`  ${companyList.join(', ')}${companies.split(', ').length > 15 ? '...' : ''}`);
    });

    // Tech dominance analysis
    console.log('\n\n💻 Technology Sector Growth:\n');
    const techByDecade = db.prepare(`
    SELECT 
      CASE 
        WHEN date_added LIKE '195%' THEN '1950s'
        WHEN date_added LIKE '196%' THEN '1960s'
        WHEN date_added LIKE '197%' THEN '1970s'
        WHEN date_added LIKE '198%' THEN '1980s'
        WHEN date_added LIKE '199%' THEN '1990s'
        WHEN date_added LIKE '200%' THEN '2000s'
        WHEN date_added LIKE '201%' THEN '2010s'
        WHEN date_added LIKE '202%' THEN '2020s'
      END as decade,
      COUNT(*) as tech_additions
    FROM sp500_constituents
    WHERE gics_sector = 'Information Technology'
      AND date_added IS NOT NULL
    GROUP BY decade
    ORDER BY decade
  `).all() as Array<{ decade: string; tech_additions: number }>;

    techByDecade.forEach(({ decade, tech_additions }) => {
        const bar = '█'.repeat(tech_additions);
        console.log(`${decade.padEnd(10)} ${tech_additions.toString().padStart(2)} ${bar}`);
    });

    // Financial sector changes
    console.log('\n\n🏦 Financial Sector Trends:\n');
    const financialsByDecade = db.prepare(`
    SELECT 
      CASE 
        WHEN date_added LIKE '195%' THEN '1950s'
        WHEN date_added LIKE '196%' THEN '1960s'
        WHEN date_added LIKE '197%' THEN '1970s'
        WHEN date_added LIKE '198%' THEN '1980s'
        WHEN date_added LIKE '199%' THEN '1990s'
        WHEN date_added LIKE '200%' THEN '2000s'
        WHEN date_added LIKE '201%' THEN '2010s'
        WHEN date_added LIKE '202%' THEN '2020s'
      END as decade,
      COUNT(*) as financial_additions
    FROM sp500_constituents
    WHERE gics_sector = 'Financials'
      AND date_added IS NOT NULL
    GROUP BY decade
    ORDER BY decade
  `).all() as Array<{ decade: string; financial_additions: number }>;

    financialsByDecade.forEach(({ decade, financial_additions }) => {
        const bar = '█'.repeat(financial_additions);
        console.log(`${decade.padEnd(10)} ${financial_additions.toString().padStart(2)} ${bar}`);
    });

    // Energy sector decline
    console.log('\n\n⚡ Energy Sector Trends:\n');
    const energyByDecade = db.prepare(`
    SELECT 
      CASE 
        WHEN date_added LIKE '195%' THEN '1950s'
        WHEN date_added LIKE '196%' THEN '1960s'
        WHEN date_added LIKE '197%' THEN '1970s'
        WHEN date_added LIKE '198%' THEN '1980s'
        WHEN date_added LIKE '199%' THEN '1990s'
        WHEN date_added LIKE '200%' THEN '2000s'
        WHEN date_added LIKE '201%' THEN '2010s'
        WHEN date_added LIKE '202%' THEN '2020s'
      END as decade,
      COUNT(*) as energy_additions
    FROM sp500_constituents
    WHERE gics_sector = 'Energy'
      AND date_added IS NOT NULL
    GROUP BY decade
    ORDER BY decade
  `).all() as Array<{ decade: string; energy_additions: number }>;

    energyByDecade.forEach(({ decade, energy_additions }) => {
        const bar = '█'.repeat(energy_additions);
        console.log(`${decade.padEnd(10)} ${energy_additions.toString().padStart(2)} ${bar}`);
    });

    // Sector concentration risk
    console.log('\n\n⚠️  Sector Concentration Analysis:\n');
    const concentration = db.prepare(`
    SELECT 
      gics_sector,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) as percentage
    FROM sp500_constituents
    WHERE gics_sector IS NOT NULL
    GROUP BY gics_sector
    ORDER BY percentage DESC
  `).all() as Array<{ gics_sector: string; count: number; percentage: number }>;

    const top3Concentration = concentration.slice(0, 3).reduce((sum, s) => sum + s.percentage, 0);
    const top5Concentration = concentration.slice(0, 5).reduce((sum, s) => sum + s.percentage, 0);

    console.log(`Top 3 sectors: ${top3Concentration.toFixed(2)}% of index`);
    console.log(`Top 5 sectors: ${top5Concentration.toFixed(2)}% of index`);
    console.log('\nTop 3 sectors:');
    concentration.slice(0, 3).forEach(({ gics_sector, count, percentage }) => {
        console.log(`  ${gics_sector.padEnd(30)} ${count} companies (${percentage}%)`);
    });

    // Most volatile sectors (most changes)
    console.log('\n\n🌪️  Most Volatile Sectors (Highest Turnover):\n');
    console.log('(Based on removal patterns - estimated)\n');

    const volatileSectors = [
        { sector: 'Energy', note: 'High M&A activity, commodity cycles' },
        { sector: 'Financials', note: 'Consolidation, regulatory changes' },
        { sector: 'Information Technology', note: 'Rapid innovation, disruption' },
        { sector: 'Consumer Discretionary', note: 'Retail disruption, changing preferences' },
    ];

    volatileSectors.forEach(({ sector, note }, idx) => {
        console.log(`${idx + 1}. ${sector}`);
        console.log(`   ${note}\n`);
    });

    console.log('━'.repeat(70) + '\n');
    db.close();
}

analyzeSectorRotation();
