import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const sector = searchParams.get('sector') || '';
        const subIndustry = searchParams.get('subIndustry') || '';
        const sortBy = searchParams.get('sortBy') || 'market_cap';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const offset = (page - 1) * limit;

        // Load weights from CSV
        const weightsPath = path.join(process.cwd(), 'public', 'data', 'SP500Weights.csv');
        const weightsContent = fs.readFileSync(weightsPath, 'utf-8');
        const weightsLines = weightsContent.trim().split('\n').slice(1); // Skip header
        const weightsMap = new Map<string, string>();

        weightsLines.forEach(line => {
            const [symbol, weight] = line.split(',');
            if (symbol && weight) {
                weightsMap.set(symbol.trim(), weight.trim());
            }
        });

        // Get S&P 500 constituents from SQLite
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        let query = `
            SELECT symbol, security, gics_sector, gics_sub_industry
            FROM sp500_constituents
            WHERE 1=1
        `;

        const params: any[] = [];

        if (search) {
            query += ` AND (symbol LIKE ? OR security LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sector) {
            query += ` AND gics_sector = ?`;
            params.push(sector);
        }

        if (subIndustry) {
            query += ` AND gics_sub_industry = ?`;
            params.push(subIndustry);
        }

        query += ` ORDER BY security`;

        const allConstituents = db.prepare(query).all(...params) as Array<{
            symbol: string;
            security: string;
            gics_sector: string;
            gics_sub_industry: string;
        }>;

        // Get unique sectors and sub-industries for filters
        const allData = db.prepare(`
            SELECT DISTINCT gics_sector, gics_sub_industry
            FROM sp500_constituents
            ORDER BY gics_sector, gics_sub_industry
        `).all() as Array<{ gics_sector: string; gics_sub_industry: string }>;

        const sectors = [...new Set(allData.map(d => d.gics_sector))].sort();

        // Create a map of sector to sub-industries
        const sectorSubIndustryMap: Record<string, string[]> = {};
        allData.forEach(d => {
            if (!sectorSubIndustryMap[d.gics_sector]) {
                sectorSubIndustryMap[d.gics_sector] = [];
            }
            if (!sectorSubIndustryMap[d.gics_sector].includes(d.gics_sub_industry)) {
                sectorSubIndustryMap[d.gics_sector].push(d.gics_sub_industry);
            }
        });

        // Sort sub-industries within each sector
        Object.keys(sectorSubIndustryMap).forEach(sector => {
            sectorSubIndustryMap[sector].sort();
        });

        db.close();

        // Get ALL price data from PostgreSQL (not paginated yet)
        const allSymbols = allConstituents.map(c => c.symbol);

        const priceData = await prisma.$queryRaw<any[]>`
            WITH latest_prices AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    date,
                    price,
                    "marketCap"
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                ORDER BY symbol, date DESC
            ),
            year_ago_prices AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_1y_ago
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '1 year'
                ORDER BY symbol, date DESC
            ),
            two_year_ago_prices AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_2y_ago
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '2 years'
                ORDER BY symbol, date DESC
            ),
            five_year_ago_prices AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_5y_ago
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '5 years'
                ORDER BY symbol, date DESC
            ),
            market_cap_1y_ago AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    "marketCap" as mcap_1y_ago
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '1 year'
                    AND "marketCap" IS NOT NULL
                ORDER BY symbol, date DESC
            ),
            market_cap_2y_ago AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    "marketCap" as mcap_2y_ago
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '2 years'
                    AND "marketCap" IS NOT NULL
                ORDER BY symbol, date DESC
            ),
            price_start_2025 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_jan2025
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2025-01-01' AND date <= '2025-01-10'
                ORDER BY symbol, date ASC
            ),
            price_start_2026 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_jan2026
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2026-01-01' AND date <= '2026-01-10'
                ORDER BY symbol, date ASC
            ),
            price_end_2025 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    close as price_dec2025
                FROM historical_prices
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2025-12-20' AND date <= '2025-12-31'
                ORDER BY symbol, date DESC
            ),
            mcap_start_2025 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    "marketCap" as mcap_jan2025
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2025-01-01' AND date <= '2025-01-10'
                    AND "marketCap" IS NOT NULL
                ORDER BY symbol, date ASC
            ),
            mcap_start_2026 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    "marketCap" as mcap_jan2026
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2026-01-01' AND date <= '2026-01-10'
                    AND "marketCap" IS NOT NULL
                ORDER BY symbol, date ASC
            ),
            mcap_end_2025 AS (
                SELECT DISTINCT ON (symbol)
                    symbol,
                    "marketCap" as mcap_dec2025
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date >= '2025-12-20' AND date <= '2025-12-31'
                    AND "marketCap" IS NOT NULL
                ORDER BY symbol, date DESC
            )
            SELECT 
                lp.symbol,
                lp.price as latest_price,
                lp."marketCap" as market_cap,
                lp.date as latest_date,
                yap.price_1y_ago,
                mc.mcap_1y_ago,
                mc2.mcap_2y_ago,
                p25.price_jan2025,
                p26.price_jan2026,
                pe25.price_dec2025,
                mc25.mcap_jan2025,
                mc26.mcap_jan2026,
                mce25.mcap_dec2025,
                CASE 
                    WHEN yap.price_1y_ago IS NOT NULL AND yap.price_1y_ago > 0 
                    THEN ((lp.price - yap.price_1y_ago) / yap.price_1y_ago * 100)
                    ELSE NULL
                END as performance_1y,
                CASE 
                    WHEN t.price_2y_ago IS NOT NULL AND t.price_2y_ago > 0 
                    THEN ((lp.price - t.price_2y_ago) / t.price_2y_ago * 100)
                    ELSE NULL
                END as performance_2y,
                CASE 
                    WHEN f.price_5y_ago IS NOT NULL AND f.price_5y_ago > 0 
                    THEN ((lp.price - f.price_5y_ago) / f.price_5y_ago * 100)
                    ELSE NULL
                END as performance_5y,
                CASE 
                    WHEN p25.price_jan2025 IS NOT NULL AND p25.price_jan2025 > 0 AND pe25.price_dec2025 IS NOT NULL
                    THEN ((pe25.price_dec2025 - p25.price_jan2025) / p25.price_jan2025 * 100)
                    ELSE NULL
                END as performance_2025,
                CASE 
                    WHEN p26.price_jan2026 IS NOT NULL AND p26.price_jan2026 > 0 
                    THEN ((lp.price - p26.price_jan2026) / p26.price_jan2026 * 100)
                    ELSE NULL
                END as performance_2026
            FROM latest_prices lp
            LEFT JOIN year_ago_prices yap ON lp.symbol = yap.symbol
            LEFT JOIN two_year_ago_prices t ON lp.symbol = t.symbol
            LEFT JOIN five_year_ago_prices f ON lp.symbol = f.symbol
            LEFT JOIN market_cap_1y_ago mc ON lp.symbol = mc.symbol
            LEFT JOIN market_cap_2y_ago mc2 ON lp.symbol = mc2.symbol
            LEFT JOIN price_start_2025 p25 ON lp.symbol = p25.symbol
            LEFT JOIN price_start_2026 p26 ON lp.symbol = p26.symbol
            LEFT JOIN price_end_2025 pe25 ON lp.symbol = pe25.symbol
            LEFT JOIN mcap_start_2025 mc25 ON lp.symbol = mc25.symbol
            LEFT JOIN mcap_start_2026 mc26 ON lp.symbol = mc26.symbol
            LEFT JOIN mcap_end_2025 mce25 ON lp.symbol = mce25.symbol
        `;

        // Create a map of price data by symbol
        const priceMap = new Map(priceData.map(p => [p.symbol, p]));

        // Combine SQLite constituent data with PostgreSQL price data and weights
        const allStocks = allConstituents.map(constituent => {
            const prices = priceMap.get(constituent.symbol);
            return {
                symbol: constituent.symbol,
                company: constituent.security,
                sector: constituent.gics_sector,
                sub_industry: constituent.gics_sub_industry,
                weight: weightsMap.get(constituent.symbol) || null,
                latest_price: prices?.latest_price ? Number(prices.latest_price) : null,
                market_cap: prices?.market_cap ? Number(prices.market_cap) : null,
                mcap_1y_ago: prices?.mcap_1y_ago ? Number(prices.mcap_1y_ago) : null,
                mcap_2y_ago: prices?.mcap_2y_ago ? Number(prices.mcap_2y_ago) : null,
                mcap_jan2025: prices?.mcap_jan2025 ? Number(prices.mcap_jan2025) : null,
                mcap_jan2026: prices?.mcap_jan2026 ? Number(prices.mcap_jan2026) : null,
                mcap_dec2025: prices?.mcap_dec2025 ? Number(prices.mcap_dec2025) : null,
                latest_date: prices?.latest_date || null,
                price_1y_ago: prices?.price_1y_ago ? Number(prices.price_1y_ago) : null,
                performance_1y: prices?.performance_1y ? Number(prices.performance_1y) : null,
                performance_2y: prices?.performance_2y ? Number(prices.performance_2y) : null,
                performance_5y: prices?.performance_5y ? Number(prices.performance_5y) : null,
                performance_2025: prices?.performance_2025 ? Number(prices.performance_2025) : null,
                performance_2026: prices?.performance_2026 ? Number(prices.performance_2026) : null,
            };
        });

        // Sort by requested column (nulls last)
        const validSortColumns = ['market_cap', 'performance_1y', 'performance_2y', 'performance_5y'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'market_cap';
        allStocks.sort((a, b) => {
            const aVal = (a as any)[sortColumn];
            const bVal = (b as any)[sortColumn];
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;
            const comparison = aVal - bVal;
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        // Now paginate the sorted results
        const total = allStocks.length;
        const totalPages = Math.ceil(total / limit);
        const stocks = allStocks.slice(offset, offset + limit);

        // Aggregate stats across all stocks
        const totalMarketCap = allStocks.reduce((sum, s) => sum + (s.market_cap || 0), 0);
        const positive1yCount = allStocks.filter(s => s.performance_1y !== null && s.performance_1y > 0).length;

        // Helper to compute distribution + concentration for a given performance key
        const buckets = [
            { label: '< -50%', min: -Infinity, max: -50 },
            { label: '-50% to -20%', min: -50, max: -20 },
            { label: '-20% to -10%', min: -20, max: -10 },
            { label: '-10% to 0%', min: -10, max: 0 },
            { label: '0% to 10%', min: 0, max: 10 },
            { label: '10% to 20%', min: 10, max: 20 },
            { label: '20% to 50%', min: 20, max: 50 },
            { label: '50% to 100%', min: 50, max: 100 },
            { label: '> 100%', min: 100, max: Infinity },
        ];

        function computeStats(perfKey: 'performance_1y' | 'performance_2y' | 'performance_2025' | 'performance_2026') {
            const mcapStartKeyMap: Record<string, string> = {
                performance_1y: 'mcap_1y_ago',
                performance_2y: 'mcap_2y_ago',
                performance_2025: 'mcap_jan2025',
                performance_2026: 'mcap_jan2026',
            };
            const mcapEndKeyMap: Record<string, string | null> = {
                performance_1y: null,       // use current market_cap
                performance_2y: null,       // use current market_cap
                performance_2025: 'mcap_dec2025',  // completed year
                performance_2026: null,     // use current market_cap (YTD)
            };
            const mcapStartKey = mcapStartKeyMap[perfKey];
            const mcapEndKey = mcapEndKeyMap[perfKey];
            const withReturns = allStocks.filter(s => (s as any)[perfKey] !== null);
            const distribution = buckets.map(b => ({
                label: b.label,
                count: withReturns.filter(s => (s as any)[perfKey]! >= b.min && (s as any)[perfKey]! < b.max).length,
            }));

            const stockContributions = allStocks
                .filter(s => (s as any)[perfKey] !== null && s.market_cap !== null)
                .map(s => {
                    const startMcap = (s as any)[mcapStartKey] as number | null;
                    const endMcap = mcapEndKey ? (s as any)[mcapEndKey] as number | null : s.market_cap;
                    return {
                        symbol: s.symbol,
                        company: s.company,
                        performance: (s as any)[perfKey]! as number,
                        market_cap: s.market_cap!,
                        contribution: (s.market_cap! / totalMarketCap) * ((s as any)[perfKey]! as number),
                        mcap_change: (endMcap !== null && startMcap !== null) ? endMcap - startMcap : null,
                    };
                })
                .sort((a, b) => b.contribution - a.contribution);

            const positiveContributors = stockContributions.filter(s => s.contribution > 0);
            const negativeContributors = stockContributions.filter(s => s.contribution < 0);

            const totalPositiveContribution = positiveContributors.reduce((sum, s) => sum + s.contribution, 0);
            let cumulative = 0;
            let stocksFor50Pct = 0;
            let stocksFor80Pct = 0;
            for (const s of positiveContributors) {
                cumulative += s.contribution;
                if (!stocksFor50Pct && cumulative >= totalPositiveContribution * 0.5) stocksFor50Pct = positiveContributors.indexOf(s) + 1;
                if (!stocksFor80Pct && cumulative >= totalPositiveContribution * 0.8) stocksFor80Pct = positiveContributors.indexOf(s) + 1;
            }

            const mapContributor = (s: typeof stockContributions[0]) => ({
                symbol: s.symbol,
                company: s.company,
                performance: Math.round(s.performance),
                contribution: Number(s.contribution.toFixed(2)),
                mcap_change: s.mcap_change,
            });

            return {
                distribution,
                concentration: {
                    totalContribution: Number(stockContributions.reduce((sum, s) => sum + s.contribution, 0).toFixed(2)),
                    positiveContributors: positiveContributors.length,
                    negativeContributors: negativeContributors.length,
                    stocksFor50Pct,
                    stocksFor80Pct,
                    top10Contributors: stockContributions.slice(0, 10).map(mapContributor),
                    bottom10Contributors: stockContributions.slice(-10).reverse().map(mapContributor),
                },
            };
        }

        const stats1y = computeStats('performance_1y');
        const stats2y = computeStats('performance_2y');
        const stats2025 = computeStats('performance_2025');
        const stats2026 = computeStats('performance_2026');

        return NextResponse.json({
            stocks,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            filters: {
                sectors,
                sectorSubIndustryMap
            },
            stats: {
                totalMarketCap,
                positive1yCount,
                '1y': stats1y,
                '2y': stats2y,
                '2025': stats2025,
                '2026': stats2026,
            }
        });
    } catch (error) {
        console.error('Error fetching SP500 stocks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stocks data' },
            { status: 500 }
        );
    }
}
