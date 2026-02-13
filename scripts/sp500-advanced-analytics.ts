#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function runAdvancedAnalytics() {
    const db = new Database(DB_PATH, { readonly: true });

    console.log('\n🔬 S&P 500 Advanced Analytics\n');
    console.log('━'.repeat(70));

    // 1. Survival rate by decade added
    console.log('\n📊 Survival Rate by Decade Added:\n');
    const survivalByDecade = db.prepare(`
    WITH decades AS (
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
          ELSE 'Unknown'
        END as decade,
        COUNT(*) as still_in_index
      FROM sp500_constituents
      WHERE date_added IS NOT NULL
      GROUP BY decade
    )
    SELECT * FROM decades WHERE decade != 'Unknown' ORDER BY decade
  `).all() as Array<{ decade: string; still_in_index: number }>;

    survivalByDecade.forEach(({ decade, still_in_index }) => {
        const bar = '█'.repeat(Math.round(still_in_index / 5));
        console.log(`${decade.padEnd(10)} ${still_in_index.toString().padStart(3)} companies ${bar}`);
    });

    // 2. Most active years for changes
    console.log('\n\n📅 Most Active Years for Index Changes:\n');
    const activeYears = db.prepare(`
    SELECT 
      '20' || SUBSTR(date, -2) as year,
      COUNT(*) as total_changes,
      COUNT(CASE WHEN added_ticker IS NOT NULL THEN 1 END) as additions,
      COUNT(CASE WHEN removed_ticker IS NOT NULL THEN 1 END) as removals
    FROM sp500_changes
    WHERE date LIKE '%-%'
    GROUP BY SUBSTR(date, -2)
    HAVING total_changes > 15
    ORDER BY total_changes DESC
    LIMIT 10
  `).all() as Array<{ year: string; total_changes: number; additions: number; removals: number }>;

    console.log('Year    Changes  Additions  Removals');
    console.log('─'.repeat(40));
    activeYears.forEach(({ year, total_changes, additions, removals }) => {
        console.log(`${year}      ${total_changes.toString().padStart(3)}      ${additions.toString().padStart(3)}        ${removals.toString().padStart(3)}`);
    });

    // 3. Companies that returned to the index
    console.log('\n\n🔄 Companies That Returned to S&P 500:\n');
    const returnedCompanies = db.prepare(`
    SELECT 
      c.symbol,
      c.security,
      c.date_added as current_date_added,
      ch.date as removal_date,
      ch.reason as removal_reason
    FROM sp500_constituents c
    JOIN sp500_changes ch ON c.symbol = ch.removed_ticker
    WHERE ch.removed_ticker IS NOT NULL
    ORDER BY c.date_added DESC
    LIMIT 10
  `).all() as Array<{
        symbol: string;
        security: string;
        current_date_added: string;
        removal_date: string;
        removal_reason: string;
    }>;

    if (returnedCompanies.length > 0) {
        returnedCompanies.forEach(({ symbol, security, current_date_added, removal_date, removal_reason }) => {
            console.log(`${symbol.padEnd(6)} ${security.padEnd(35)}`);
            console.log(`         Removed: ${removal_date} (${removal_reason.substring(0, 50)}...)`);
            console.log(`         Re-added: ${current_date_added}\n`);
        });
    } else {
        console.log('No companies found that returned to the index.\n');
    }

    // 4. Acquisition activity by year
    console.log('\n📈 Acquisition Activity (Top Years):\n');
    const acquisitionsByYear = db.prepare(`
    SELECT 
      '20' || SUBSTR(date, -2) as year,
      COUNT(*) as acquisitions
    FROM sp500_changes
    WHERE (reason LIKE '%acquired%' OR reason LIKE '%Acquired%')
      AND date LIKE '%-%'
    GROUP BY SUBSTR(date, -2)
    ORDER BY acquisitions DESC
    LIMIT 10
  `).all() as Array<{ year: string; acquisitions: number }>;

    acquisitionsByYear.forEach(({ year, acquisitions }) => {
        const bar = '▓'.repeat(Math.round(acquisitions / 2));
        console.log(`${year}    ${acquisitions.toString().padStart(2)} ${bar}`);
    });

    // 5. Sector diversity over time (recent additions)
    console.log('\n\n🎨 Recent Additions by Sector (2020-2026):\n');
    const recentBySector = db.prepare(`
    SELECT 
      c.gics_sector,
      COUNT(*) as count
    FROM sp500_constituents c
    WHERE c.date_added >= '2020-01-01'
    GROUP BY c.gics_sector
    ORDER BY count DESC
  `).all() as Array<{ gics_sector: string; count: number }>;

    recentBySector.forEach(({ gics_sector, count }) => {
        const bar = '█'.repeat(count);
        console.log(`${gics_sector.padEnd(30)} ${count.toString().padStart(2)} ${bar}`);
    });

    // 6. Geographic concentration
    console.log('\n\n🌎 Top States by Company Headquarters:\n');
    const topStates = db.prepare(`
    SELECT 
      CASE 
        WHEN headquarters_location LIKE '%California%' THEN 'California'
        WHEN headquarters_location LIKE '%Texas%' THEN 'Texas'
        WHEN headquarters_location LIKE '%New York%' THEN 'New York'
        WHEN headquarters_location LIKE '%Illinois%' THEN 'Illinois'
        WHEN headquarters_location LIKE '%Massachusetts%' THEN 'Massachusetts'
        WHEN headquarters_location LIKE '%Pennsylvania%' THEN 'Pennsylvania'
        WHEN headquarters_location LIKE '%Ohio%' THEN 'Ohio'
        WHEN headquarters_location LIKE '%Florida%' THEN 'Florida'
        WHEN headquarters_location LIKE '%Georgia%' THEN 'Georgia'
        WHEN headquarters_location LIKE '%Virginia%' THEN 'Virginia'
        ELSE 'Other'
      END as state,
      COUNT(*) as count
    FROM sp500_constituents
    WHERE headquarters_location IS NOT NULL
    GROUP BY state
    ORDER BY count DESC
    LIMIT 10
  `).all() as Array<{ state: string; count: number }>;

    topStates.forEach(({ state, count }) => {
        const bar = '█'.repeat(Math.round(count / 3));
        console.log(`${state.padEnd(20)} ${count.toString().padStart(3)} ${bar}`);
    });

    // 7. Age distribution
    console.log('\n\n🕰️  Company Age Distribution:\n');
    const ageDistribution = db.prepare(`
    SELECT 
      CASE 
        WHEN CAST(SUBSTR(founded, 1, 4) AS INTEGER) < 1900 THEN 'Pre-1900'
        WHEN CAST(SUBSTR(founded, 1, 4) AS INTEGER) BETWEEN 1900 AND 1949 THEN '1900-1949'
        WHEN CAST(SUBSTR(founded, 1, 4) AS INTEGER) BETWEEN 1950 AND 1979 THEN '1950-1979'
        WHEN CAST(SUBSTR(founded, 1, 4) AS INTEGER) BETWEEN 1980 AND 1999 THEN '1980-1999'
        WHEN CAST(SUBSTR(founded, 1, 4) AS INTEGER) >= 2000 THEN '2000+'
        ELSE 'Unknown'
      END as era,
      COUNT(*) as count
    FROM sp500_constituents
    WHERE founded IS NOT NULL AND founded != ''
    GROUP BY era
    ORDER BY 
      CASE era
        WHEN 'Pre-1900' THEN 1
        WHEN '1900-1949' THEN 2
        WHEN '1950-1979' THEN 3
        WHEN '1980-1999' THEN 4
        WHEN '2000+' THEN 5
        ELSE 6
      END
  `).all() as Array<{ era: string; count: number }>;

    ageDistribution.forEach(({ era, count }) => {
        const bar = '█'.repeat(Math.round(count / 5));
        console.log(`${era.padEnd(15)} ${count.toString().padStart(3)} ${bar}`);
    });

    // 8. Oldest companies still in index
    console.log('\n\n👴 Oldest Companies Still in S&P 500:\n');
    const oldestCompanies = db.prepare(`
    SELECT symbol, security, founded, gics_sector
    FROM sp500_constituents
    WHERE founded IS NOT NULL 
      AND founded != ''
      AND LENGTH(founded) >= 4
    ORDER BY CAST(SUBSTR(founded, 1, 4) AS INTEGER)
    LIMIT 15
  `).all() as Array<{ symbol: string; security: string; founded: string; gics_sector: string }>;

    oldestCompanies.forEach(({ symbol, security, founded, gics_sector }) => {
        console.log(`${symbol.padEnd(6)} ${security.padEnd(40)} ${founded.padEnd(10)} ${gics_sector}`);
    });

    console.log('\n' + '━'.repeat(70) + '\n');
    db.close();
}

runAdvancedAnalytics();
