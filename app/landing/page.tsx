import { prisma } from '@/lib/prisma';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import {
    HeroSection,
    LiveRegimeStrip,
    StatsBar,
    FrameworkSection,
    FeaturesGrid,
    ReadingOrder,
    CTAFooter,
} from '@/components/landing/animated-sections';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Live data fetch ──────────────────────────────────────────────────────────

async function getLiveSnapshot() {
    try {
        const [regimeRows, reyRows, eypRows, sp500Rows] = await Promise.all([
            prisma.$queryRaw<{ regime: string; entry_date: string; date: string }[]>`
                SELECT regime, entry_date::text as entry_date, date::text as date
                FROM macro_regime_timeline ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Earnings-Yield-Premium-5yr'
                ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number; date: string }[]>`
                SELECT value, date::text as date FROM macro_time_series
                WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
                ORDER BY date DESC LIMIT 1`,
        ]);

        const regime = regimeRows[0];
        const rey = reyRows[0]?.value ?? null;
        const eyp = eypRows[0]?.value ?? null;
        const sp500 = sp500Rows[0] ?? null;

        if (!regime) return null;

        const meta = REGIME_METADATA[regime.regime as RegimeFamily];
        const entryDate = new Date(regime.entry_date);
        const currentDate = new Date(regime.date);
        const monthsInRegime =
            (currentDate.getFullYear() - entryDate.getFullYear()) * 12 +
            (currentDate.getMonth() - entryDate.getMonth());

        return {
            regime: regime.regime as RegimeFamily,
            color: meta?.color ?? '#6b7280',
            description: meta?.description ?? '',
            guidance: meta?.guidance ?? '',
            entryDate: regime.entry_date,
            monthsInRegime,
            rey,
            eyp,
            sp500,
        };
    } catch {
        return null;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
    const snapshot = await getLiveSnapshot();

    return (
        <div className="relative">
            <HeroSection />
            {snapshot && <LiveRegimeStrip snapshot={snapshot} />}
            <StatsBar />
            <FrameworkSection />
            <FeaturesGrid />
            <ReadingOrder />
            <CTAFooter />
        </div>
    );
}
