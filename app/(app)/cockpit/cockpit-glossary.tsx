'use client';

import { useState } from 'react';

const SECTIONS = [
    {
        title: 'Liquidity',
        color: 'text-blue-400',
        items: [
            {
                name: 'Real 3M',
                formula: '3M Yield − CPI YoY',
                description: 'Real short-term rate. Negative means the Fed is effectively subsidising borrowing — loose liquidity. Deeply negative readings historically precede inflation spikes or asset bubbles.',
            },
            {
                name: 'Real 10Y',
                formula: '10Y Yield − CPI YoY',
                description: 'Real long-term rate. The anchor for all asset valuations. Below -0.5% triggers the Bond Stress signal — bonds are no longer preserving purchasing power.',
            },
            {
                name: 'Yield Curve (10Y−3M)',
                formula: '10Y Yield − 3M Yield',
                description: 'Slope of the yield curve. Positive = normal (growth expected). Negative = inverted (recession risk, broken credit transmission). Used in Equity Danger and Growth signals.',
            },
            {
                name: 'Real M2 YoY',
                formula: 'M2 Growth YoY − CPI YoY',
                description: 'Real money supply growth. Positive = liquidity expanding faster than inflation (supportive). Negative = real monetary tightening. Informs the Liquidity regime classification.',
            },
        ],
    },
    {
        title: 'Valuation',
        color: 'text-purple-400',
        items: [
            {
                name: 'EYP 5yr',
                formula: 'EY 5yr − 3M Yield',
                description: 'Earnings Yield Premium over the risk-free rate (5yr smoothed EPS). Measures whether equities compensate you for the risk vs just holding cash. Below -1% with an inverted curve triggers Equity Danger.',
            },
            {
                name: 'Real EY 5yr',
                formula: 'EY 5yr − CPI YoY',
                description: 'Real Earnings Yield — what equities earn above inflation. The primary valuation signal. Below 0.5% = Real EY Warning. Below -1% = Real EY Sell. Above 3% = Equity Value (buy signal).',
            },
            {
                name: 'PE 5yr',
                formula: 'S&P 500 Price ÷ 5yr Avg EPS',
                description: 'Price-to-earnings using a 5-year smoothed earnings base to reduce cyclical distortion. High percentile = expensive relative to history.',
            },
            {
                name: 'EY 5yr',
                formula: '1 ÷ PE 5yr × 100',
                description: 'Earnings yield — the inverse of PE. Expresses equity return potential as a percentage, making it directly comparable to bond yields and inflation.',
            },
        ],
    },
    {
        title: 'Price Environment',
        color: 'text-orange-400',
        items: [
            {
                name: 'CPI YoY',
                formula: 'Consumer Price Index, year-over-year %',
                description: 'Headline inflation. Drives the Price Environment regime (Deflation → Low → Target → Moderate → Elevated → High). Also used to compute all real rates.',
            },
            {
                name: 'Fed Funds',
                formula: 'Federal Funds Rate (effective)',
                description: 'The overnight rate set by the Fed. Compared to CPI to assess whether monetary policy is restrictive or accommodative in real terms.',
            },
        ],
    },
    {
        title: 'Trend Pressure',
        color: 'text-green-400',
        items: [
            {
                name: '200MA Slope',
                formula: 'Rate of change of the 200-day moving average',
                description: 'Measures whether the long-term trend is accelerating or decelerating. Positive and rising = strong uptrend. Turning negative = trend deterioration.',
            },
            {
                name: 'Divergence',
                formula: '(Price − 200MA) ÷ 200MA × 100',
                description: 'How far price is stretched above or below its 200-day MA. Extreme positive divergence signals overextension. Negative divergence signals potential mean reversion opportunity.',
            },
            {
                name: 'Slope Streak',
                formula: 'Consecutive days 200MA slope is positive/negative',
                description: 'Trend persistence indicator. A long positive streak confirms a durable uptrend. A streak turning negative is an early warning of trend change.',
            },
            {
                name: 'Days Above 200MA',
                formula: 'Consecutive days price has closed above the 200MA',
                description: 'Measures trend health and breadth. Extended streaks above the 200MA indicate a healthy bull market.',
            },
        ],
    },
    {
        title: 'Signals',
        color: 'text-red-400',
        items: [
            {
                name: 'Bond Stress',
                formula: 'Real 10Y < -0.5%',
                description: 'Bonds are failing to preserve purchasing power. The financial system loses its real risk-free anchor. Rotate to gold and real assets. Highest priority risk-off signal.',
            },
            {
                name: 'Real EY Warning',
                formula: 'Real EY 5yr < 0.5%',
                description: 'Equities are barely clearing inflation. First level of the valuation warning — reduce equity aggressiveness.',
            },
            {
                name: 'Real EY Sell',
                formula: 'Real EY 5yr < -1%',
                description: 'Equities are failing to clear inflation. Sell or underweight equities. Rotate to bonds (if Real 10Y > 0%) or gold.',
            },
            {
                name: 'Equity Danger',
                formula: 'EYP 5yr < -1% AND Yield Curve < 0',
                description: 'Expensive equities combined with an inverted yield curve. Broken liquidity transmission — growth cannot be financed cheaply. High crash risk.',
            },
            {
                name: 'Growth Signal',
                formula: 'EYP 5yr < -1% AND Yield Curve > 0',
                description: 'Equities are expensive but the yield curve is positive — growth can still be financed. Favor high-growth equities over value.',
            },
            {
                name: 'Equity Value',
                formula: 'Real EY 5yr ≥ 3%',
                description: 'Equities offer strong real compensation above inflation. A buy signal for broad equity exposure with a high margin of safety.',
            },
        ],
    },
    {
        title: 'Live Snapshot',
        color: 'text-cyan-400',
        items: [
            {
                name: 'EY 2yr / PE 2yr',
                formula: 'Based on 2-year smoothed EPS',
                description: 'Shorter-horizon valuation using a 2-year EPS average. More sensitive to recent earnings trends than the 5yr versions. Useful for spotting near-term valuation shifts.',
            },
            {
                name: 'CPI / M2 (editable)',
                formula: 'User-adjustable inputs',
                description: 'You can override CPI and M2 to run what-if scenarios — e.g. "what if inflation drops to 2%?" The derived metrics (Real 10Y, Real EY, etc.) update in real time.',
            },
        ],
    },
];

export default function CockpitGlossary() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
                parameter guide
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
                            <div>
                                <div className="text-sm font-semibold">Parameter Guide</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Definitions, formulas, and signal logic</div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5 space-y-7">
                            {SECTIONS.map(section => (
                                <div key={section.title}>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${section.color}`}>
                                        {section.title}
                                    </div>
                                    <div className="space-y-4">
                                        {section.items.map(item => (
                                            <div key={item.name} className="grid grid-cols-[160px_1fr] gap-4">
                                                <div>
                                                    <div className="text-xs font-semibold">{item.name}</div>
                                                    <code className="text-[10px] text-muted-foreground/70 font-mono leading-relaxed">{item.formula}</code>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
