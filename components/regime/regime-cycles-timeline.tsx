'use client';

import { useState } from 'react';
import CycleCard, { Section, Phase, Row, MiniNote, Break, RegimeEvent } from './cycle-card';
import CycleChartsModal from './cycle-charts-modal';

const cyclesData = [
    {
        cycleNumber: 1,
        title: "Asset Bubble Regime",
        subtitle: "Internet & Housing",
        period: "1996 – 2008",
        accent: "from-cyan-500/20 to-blue-500/20",
        borderAccent: "border-l-cyan-400",
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
    const [expandedCycle, setExpandedCycle] = useState<number | null>(1);

    return (
        <div className="space-y-5">
            {cyclesData.map((cycle) => (
                <CycleCard
                    key={cycle.cycleNumber}
                    cycleNumber={cycle.cycleNumber}
                    title={cycle.title}
                    subtitle={cycle.subtitle}
                    period={cycle.period}
                    accent={cycle.accent}
                    borderAccent={cycle.borderAccent}
                    isExpanded={expandedCycle === cycle.cycleNumber}
                    onToggle={() => setExpandedCycle(expandedCycle === cycle.cycleNumber ? null : cycle.cycleNumber)}
                    isCurrent={cycle.isCurrent}
                >
                    {cycle.charts && cycle.charts.length > 0 && (
                        <CycleChartsModal
                            cycleNumber={cycle.cycleNumber}
                            cycleTitle={cycle.title}
                            charts={cycle.charts}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Section label="Old Mechanism Failing">
                            {cycle.oldMechanism}
                        </Section>

                        <Section label="Transition (~2 years)">
                            {cycle.transition}
                        </Section>
                    </div>

                    {cycle.phases.map((phase, idx) => (
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

                            {idx === 0 && cycle.phases.length > 1 && (
                                <Break kind="phase">
                                    {cycle.cycleNumber === 1 && "Dot-com crash (2000) — long-duration equities collapse."}
                                    {cycle.cycleNumber === 2 && "Crisis recovery largely completes. Markets begin functioning more normally again."}
                                    {cycle.cycleNumber === 3 && "Inflation accelerates. Central banks are forced to raise rates and tighten liquidity conditions."}
                                </Break>
                            )}
                        </div>
                    ))}

                    {cycle.regimeBreak && (
                        <RegimeEvent
                            year={cycle.regimeBreak.year}
                            title="Regime Break"
                            description={cycle.regimeBreak.description}
                            breakdown={cycle.regimeBreak.breakdown}
                        />
                    )}
                </CycleCard>
            ))}
        </div>
    );
}
