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
                    price as price_1y_ago
                FROM stock_snapshot
                WHERE symbol = ANY(${allSymbols}::text[])
                    AND date <= CURRENT_DATE - INTERVAL '1 year'
                ORDER BY symbol, date DESC
            )
            SELECT 
                lp.symbol,
                lp.price as latest_price,
                lp."marketCap" as market_cap,
                lp.date as latest_date,
                yap.price_1y_ago,
                CASE 
                    WHEN yap.price_1y_ago IS NOT NULL AND yap.price_1y_ago > 0 
                    THEN ((lp.price - yap.price_1y_ago) / yap.price_1y_ago * 100)
                    ELSE NULL
                END as performance_1y
            FROM latest_prices lp
            LEFT JOIN year_ago_prices yap ON lp.symbol = yap.symbol
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
                latest_date: prices?.latest_date || null,
                price_1y_ago: prices?.price_1y_ago ? Number(prices.price_1y_ago) : null,
                performance_1y: prices?.performance_1y ? Number(prices.performance_1y) : null,
            };
        });

        // Sort by market cap (descending, nulls last)
        allStocks.sort((a, b) => {
            if (a.market_cap === null && b.market_cap === null) return 0;
            if (a.market_cap === null) return 1;
            if (b.market_cap === null) return -1;
            return b.market_cap - a.market_cap;
        });

        // Now paginate the sorted results
        const total = allStocks.length;
        const totalPages = Math.ceil(total / limit);
        const stocks = allStocks.slice(offset, offset + limit);

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
