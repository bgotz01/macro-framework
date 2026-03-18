/**
 * Build Historical Regime Timeline
 * 
 * Processes all historical data to determine regime transitions
 * and stores them in the database for efficient retrieval.
 */

import Database from 'better-sqlite3';
import path from 'path';
import {
    determineNextRegime,
    type RegimeFamily,
    type CurrentConditions,
    type RegimeState
} from '../lib/regime-state-machine';
import {
    calculateLiquidityRegime,
    calculateValuationRegime
} from '../lib/regime-config';
import { calculateFlowTrendState } from '../lib/regime-config/flow-trend-config';

interface MonthlyData {
    date: string;
    fedFunds: number | null;
    irx: number | null;
    tnx: number | null;
    cpi: number | null;
    eyp5yr: number | null;
    rey5yr: number | null;
    real10Y: number | null;
    real3M: number | null;
    realM2: number | null;
    yieldCurve: number | null;
    pe5yr: number | null;
    ey5yr: number | null;
    slope200MA: number | null;
    divergence200MA: number | null;
    slopeStreak200MA: number | null;
}

async function buildRegimeTimeline() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('Building regime timeline...');

    try {
        // Drop existing table and create new one with correct schema
        db.exec(`
            DROP TABLE IF EXISTS regime_timeline;
            
            CREATE TABLE regime_timeline (
                date TEXT PRIMARY KEY,
                regime TEXT NOT NULL,
                entry_date TEXT NOT NULL,
                trigger_reason TEXT NOT NULL,
                liquidity_score REAL,
                rey REAL,
                eyp REAL,
                real10Y REAL,
                real3M REAL,
                realM2 REAL
            );
            
            CREATE INDEX idx_regime_timeline_regime ON regime_timeline(regime);
            CREATE INDEX idx_regime_timeline_entry_date ON regime_timeline(entry_date);
        `);

        // Get all unique dates that have the required derived metrics
        const dates = db.prepare(`
            SELECT DISTINCT date
            FROM percentile_analysis
            WHERE date >= '1960-01-01'
            AND series_name = 'Real-Earnings-Yield-5yr'
            ORDER BY date ASC
        `).all() as { date: string }[];

        console.log(`Processing ${dates.length} dates...`);

        let currentState: RegimeState | null = null;
        let processedCount = 0;

        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO regime_timeline 
            (date, regime, entry_date, trigger_reason, liquidity_score, rey, eyp, real10Y, real3M, realM2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((dates: { date: string }[]) => {
            for (const { date } of dates) {
                const data = getMonthlyData(db, date);
                if (!data) continue;

                const conditions = buildConditions(data);
                const regimeState = determineNextRegime(
                    currentState,
                    conditions,
                    date
                );

                // Check if regime changed
                if (regimeState.regime !== currentState?.regime) {
                    console.log(`${date}: Regime transition to ${regimeState.regime} - ${regimeState.triggerReason}`);
                }

                // Update current state
                currentState = regimeState;

                // Store regime state for this date
                insertStmt.run(
                    date,
                    currentState.regime,
                    currentState.entryDate,
                    currentState.triggerReason,
                    conditions.liquidityScore,
                    conditions.rey,
                    conditions.eyp,
                    conditions.real10Y,
                    conditions.real3M,
                    conditions.realM2
                );

                processedCount++;
                if (processedCount % 100 === 0) {
                    console.log(`Processed ${processedCount}/${dates.length} dates...`);
                }
            }
        });

        transaction(dates);

        console.log(`\nCompleted! Processed ${processedCount} dates.`);

        // Show regime summary
        const summary = db.prepare(`
            SELECT 
                regime,
                COUNT(*) as months,
                MIN(date) as first_occurrence,
                MAX(date) as last_occurrence
            FROM regime_timeline
            GROUP BY regime
            ORDER BY regime
        `).all();

        console.log('\nRegime Summary:');
        console.table(summary);

        // Show recent transitions
        const recentTransitions = db.prepare(`
            SELECT 
                date,
                regime,
                entry_date,
                trigger_reason
            FROM regime_timeline
            WHERE date = entry_date
            ORDER BY date DESC
            LIMIT 10
        `).all();

        console.log('\nRecent Regime Transitions:');
        console.table(recentTransitions);

    } catch (error) {
        console.error('Error building regime timeline:', error);
        throw error;
    } finally {
        db.close();
    }
}

function getMonthlyData(db: Database.Database, date: string): MonthlyData | null {
    const series = [
        { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
        { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
        { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
        { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
        { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
        { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
        { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
        { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
        { asset_class: 'economic', series_name: 'Real-M2-YoY', key: 'realM2' },
        { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },
        { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
        { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
        { asset_class: 'derived', series_name: 'SP500-200MA-Slope', key: 'slope200MA' },
        { asset_class: 'derived', series_name: 'SP500-200MA-Div', key: 'divergence200MA' },
        { asset_class: 'derived', series_name: 'SP500-200MA-SlopeStreak', key: 'slopeStreak200MA' }
    ];

    const data: any = { date };

    for (const s of series) {
        const row = db.prepare(`
            SELECT value
            FROM percentile_analysis
            WHERE asset_class = ? AND series_name = ? AND date = ?
            LIMIT 1
        `).get(s.asset_class, s.series_name, date) as { value: number } | undefined;

        data[s.key] = row ? row.value : null;
    }

    // Forward-fill slope200MA if missing (SP500 daily data may not land on exact month-end)
    if (data.slope200MA === null) {
        const prior = db.prepare(`
            SELECT value FROM percentile_analysis
            WHERE asset_class = 'derived' AND series_name = 'SP500-200MA-Slope' AND date < ?
            ORDER BY date DESC LIMIT 1
        `).get(date) as { value: number } | undefined;
        if (prior) data.slope200MA = prior.value;
    }

    return data as MonthlyData;
}

function buildConditions(data: MonthlyData): CurrentConditions {
    // Calculate liquidity regime for context
    const liquidityRegime = calculateLiquidityRegime(
        data.real3M,
        data.real10Y,
        data.yieldCurve,
        data.realM2
    );

    // Calculate flow/trend state for context
    const flowTrendState = calculateFlowTrendState(
        data.slope200MA,
        data.divergence200MA,
        data.slopeStreak200MA
    );

    return {
        // Primary metrics for regime determination
        rey: data.rey5yr,
        eyp: data.eyp5yr,
        real10Y: data.real10Y,
        real3M: data.real3M,
        realM2: data.realM2,

        // Context metrics
        liquidityScore: liquidityRegime.score.total,
        stage: flowTrendState.stage.label,
        pressure: flowTrendState.pressure.label,
        risk: flowTrendState.risk.label,
        direction: flowTrendState.direction.label,
        trendAge: data.slopeStreak200MA,  // Trend age in days (positive or negative)
        slope200MA: data.slope200MA
    };
}

// Run the script
buildRegimeTimeline().catch(console.error);
