'use client';

import { useState } from 'react';
import CycleCard, { Section, Phase, Row, MiniNote, Break, RegimeEvent } from './cycle-card';


const cyclesData = [
    {
        cycleNumber: 1,
        title: "Asset Bubble Regime",
        subtitle: "Internet & Housing",
        period: "1996 – 2008",
        accent: "from-cyan-500/20 to-blue-500/20",
        borderAccent: "border-l-cyan-400",
        tabColor: "text-cyan-400 border-cyan-400",
        charts: [
            { name: "Earnings Yield Premium", path: "/charts/context/1996/EYP.png" },
            { name: "Fed Funds Rate", path: "/charts/context/1996/FedFunds.png" }
        ],
        oldMechanism: "Normal credit expansion and multiple growth begins to stall.",
        transition: "Early internet adoption and speculative equity appetite accelerate.",
        phases: [
            {
                title: "Phase 1",
                subtitle: "Tech Duration Bubble",
                period: "1996–2000",
                drivers: "Negative EYP • Low Real Earnings Yield",
                result: "Growth equities dominate • Extreme multiple expansion • Internet speculation",
                isCurrent: false
            },
            {
                title: "Phase 2",
                subtitle: "Housing & Credit Expansion",
                period: "2001–2007",
                note: "Tech crash destroys speculative tech appetite. Capital rotates toward real assets.",
                drivers: "Low interest rates • Credit expansion • Mortgage securitization",
                result: "Real estate boom • Financial sector expansion • Household leverage",
                isCurrent: false
            }
        ],
        regimeBreak: {
            year: "2008",
            description: "Housing and credit collapse.",
            breakdown: "Lower interest rates no longer stimulate the system. Debt saturation prevents further transmission."
        }
    },
    {
        cycleNumber: 2,
        title: "Liquidity Regime",
        subtitle: "QE Era",
        period: "2008 – 2020",
        accent: "from-violet-500/20 to-fuchsia-500/20",
        borderAccent: "border-l-violet-400",
        tabColor: "text-violet-400 border-violet-400",
        charts: [
            { name: "Earnings Yield Premium", path: "/charts/context/2008/EYP.png" },
            { name: "Fed Funds Rate", path: "/charts/context/2008/FedFunds.png" }
        ],
        oldMechanism: "Interest-rate stimulus.",
        transition: "Financial crisis and Fed intervention. QE is introduced as the new transmission mechanism.",
        phases: [
            {
                title: "Phase 1",
                subtitle: "QE Stabilization",
                period: "2008–2012",
                drivers: "Quantitative Easing • Emergency liquidity",
                result: "Asset prices stabilize • Valuations normalize • Financial system recapitalizes",
                isCurrent: false
            },
            {
                title: "Phase 2",
                subtitle: "Liquidity Expansion",
                period: "2012–2020",
                note: "Rise of the platform economy: social media, cloud, mobile.",
                drivers: "Positive EYP • Low Real Earnings Yield • Zero interest rates",
                result: "Growth stocks dominate • Passive investing boom • Mega-cap tech concentration",
                isCurrent: false
            }
        ],
        regimeBreak: {
            year: "2020",
            description: "COVID lockdowns force direct fiscal response.",
            breakdown: "QE and multiple expansion alone no longer work. Liquidity must reach the real economy."
        }
    },
    {
        cycleNumber: 3,
        title: "Fiscal / Power Regime",
        subtitle: "Stimulus, Inflation, Consolidation",
        period: "2020 – ~2032",
        accent: "from-amber-500/20 to-orange-500/20",
        borderAccent: "border-l-amber-400",
        tabColor: "text-amber-400 border-amber-400",
        isCurrent: true,
        charts: [
            { name: "Earnings Yield Premium", path: "/charts/context/2020/EYP.png" },
            { name: "M1 Money Supply", path: "/charts/context/2020/M1MoneySupply.png" }
        ],
        oldMechanism: "QE-driven asset inflation.",
        transition: "Direct stimulus, money supply expansion, and inflation emerge together.",
        phases: [
            {
                title: "Phase 1",
                subtitle: "Liquidity Mania & Crash",
                period: "2020–2024",
                drivers: "Massive balance-sheet expansion • Fiscal stimulus • Liquidity surge",
                result: "Speculative mania • SPACs • Meme stocks • Crypto bubble",
                isCurrent: false
            },
            {
                title: "Phase 2",
                subtitle: "Power Consolidation",
                period: "2024+",
                isCurrent: true,
                note: "Ongoing transition: emergence of the AI infrastructure economy.",
                drivers: "Weak or negative Real Earnings Yield • Negative EYP • Capital concentration",
                result: "Power consolidation • War • Semiconductors (AI)"
            }
        ]
    }
];

export default function RegimeCyclesTimeline() {
    const [activeTab, setActiveTab] = useState<number>(1);

    const activeCycle = cyclesData.find(c => c.cycleNumber === activeTab)!;

    return (
        <div className="space-y-0">
            {/* Tabs */}
            <div className="overflow-x-auto rounded-t-2xl border border-b-0 border-border/70 bg-card/80 px-3 pt-3 backdrop-blur-sm">
                <div className="flex gap-1 min-w-max">
                    {cyclesData.map((cycle) => {
                        const isActive = activeTab === cycle.cycleNumber;
                        return (
                            <button
                                key={cycle.cycleNumber}
                                onClick={() => setActiveTab(cycle.cycleNumber)}
                                className={`relative flex flex-col items-start gap-0.5 rounded-t-xl border-b-2 px-4 py-3 text-left transition-all whitespace-nowrap ${isActive
                                    ? `${cycle.tabColor} bg-background/60`
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${isActive ? 'border-current bg-current/10' : 'border-border bg-muted/30'
                                        }`}>
                                        {cycle.cycleNumber}
                                    </span>
                                    <span className="text-sm font-semibold leading-tight">{cycle.title}</span>
                                    {cycle.isCurrent && (
                                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <span className="pl-7 text-[11px] font-medium uppercase tracking-[0.12em] opacity-70">
                                    {cycle.period}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Expanded content */}
            <div className={`rounded-b-2xl border border-border/70 bg-card/80 backdrop-blur-sm ${activeCycle.borderAccent} border-l-4`}>
                <div className={`bg-gradient-to-r ${activeCycle.accent} px-5 py-4`}>
                    <p className="text-sm text-muted-foreground">{activeCycle.subtitle}</p>
                </div>

                <div className="border-t border-border/60 bg-background/40 px-5 py-5">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Section label="Old Mechanism Failing">
                                {activeCycle.oldMechanism}
                            </Section>
                            <Section label="Transition (~2 years)">
                                {activeCycle.transition}
                            </Section>
                        </div>

                        {activeCycle.phases.map((phase, idx) => (
                            <div key={idx}>
                                <Phase
                                    title={phase.title}
                                    subtitle={phase.subtitle}
                                    period={phase.period}
                                    isCurrent={phase.isCurrent}
                                >
                                    {phase.note && <MiniNote>{phase.note}</MiniNote>}
                                    <Row label="Drivers">{phase.drivers}</Row>
                                    <Row label="Result">{phase.result}</Row>
                                </Phase>

                                {idx === 0 && activeCycle.phases.length > 1 && (
                                    <Break kind="phase">
                                        {activeCycle.cycleNumber === 1 && "Dot-com crash (2000) — long-duration equities collapse."}
                                        {activeCycle.cycleNumber === 2 && "Crisis recovery largely completes. Markets begin functioning more normally again."}
                                        {activeCycle.cycleNumber === 3 && "Inflation accelerates. Central banks are forced to raise rates and tighten liquidity conditions."}
                                    </Break>
                                )}
                            </div>
                        ))}

                        {activeCycle.regimeBreak && (
                            <RegimeEvent
                                year={activeCycle.regimeBreak.year}
                                title="Regime Break"
                                description={activeCycle.regimeBreak.description}
                                breakdown={activeCycle.regimeBreak.breakdown}
                            />
                        )}

                        {activeCycle.charts && activeCycle.charts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeCycle.charts.map((chart) => (
                                    <div key={chart.name} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                            {chart.name}
                                        </div>
                                        <img
                                            src={chart.path}
                                            alt={chart.name}
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
