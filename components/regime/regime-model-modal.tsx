'use client';

import { useState } from 'react';

interface RegimeModelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabId = 'overview' | 'system-stress' | 'equities-adverse' | 'equity-danger' | 'growth-regime' | 'equity-value' | 'normal';

interface TabData {
    id: TabId;
    label: string;
}

interface RotationOption {
    condition?: string;
    title: string;
    description: string;
    note?: string;
}

interface RegimeTabContent {
    emoji: string;
    title: string;
    titleColor: string;
    subtitle: string;
    category: {
        name: string;
        color: string;
        description: string;
    };
    trigger: string | string[];
    meaning: string[];
    rotations?: RotationOption[];
    rotation?: {
        title: string;
        description: string;
        bullets: string[];
    };
    note?: string;
    examples: string[];
    insight?: string;
}

const TABS: TabData[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'system-stress', label: '1️⃣ System Stress' },
    { id: 'equities-adverse', label: '2️⃣ Equities Adverse' },
    { id: 'equity-danger', label: '3️⃣ Equity Danger' },
    { id: 'growth-regime', label: '4️⃣ Growth Regime' },
    { id: 'equity-value', label: '5️⃣ Equity Value' },
    { id: 'normal', label: '6️⃣ Normal' },
];

const REGIME_CONTENT: Record<Exclude<TabId, 'overview'>, RegimeTabContent> = {
    'system-stress': {
        emoji: '⚠️',
        title: 'System Stress Regime',
        titleColor: 'text-red-600 dark:text-red-400',
        subtitle: 'Highest priority - overrides all other regimes',
        category: {
            name: '🟥 Risk-Off / Defensive',
            color: 'text-red-600 dark:text-red-400',
            description: 'Financial system unanchored → Gold / real assets',
        },
        trigger: 'Real 10Y < -0.5%',
        meaning: [
            'The long-term risk-free rate fails in real terms',
            'Financial assets lose a stable valuation anchor',
            'Bonds no longer preserve purchasing power',
            'Capital seeks protection in real assets',
        ],
        rotations: [
            {
                title: '🏆 Primary: Gold / Real Assets',
                description: 'Commodities, real estate, inflation hedges - assets that preserve purchasing power when financial assets fail',
                note: 'Expecting continued inflation or stagflation',
            },
            {
                title: '📉 Alternative: Sell Equities',
                description: 'Move to cash or short-term instruments if expecting rate hikes or deflation to restore real yields',
                note: 'Expecting aggressive Fed tightening or deflationary forces',
            },
        ],
        examples: [
            '1970s stagflation (gold/commodities outperformed)',
            '2021-2022 inflation surge (real assets protected capital)',
        ],
        insight: 'When the risk-free rate fails to provide real returns, the entire financial system\'s pricing mechanism breaks down. No financial asset can be reliably valued.',
    },
    'equities-adverse': {
        emoji: '🔻',
        title: 'Equities Adverse Regime',
        titleColor: 'text-red-600 dark:text-red-400',
        subtitle: 'Second priority - when equities fail structurally',
        category: {
            name: '🟥 Risk-Off / Defensive',
            color: 'text-red-600 dark:text-red-400',
            description: 'Equity economics broken → Bonds (if real yields positive) or gold',
        },
        trigger: ['Real EY < 0%', 'AND Real 10Y ≥ 0% (System Stress not active)'],
        meaning: [
            'Equities fail to clear inflation',
            'Equity risk is underpaid',
            'Long-term equity returns structurally weak',
            'Capital should prefer defensive assets',
        ],
        rotations: [
            {
                condition: 'If Real 10Y > 0%:',
                title: '💰 Rotate to Bonds',
                description: 'Bonds offer positive real yield with lower risk than equities',
                note: '2000-2002 (negative real earnings during recession, but bonds provided positive real returns)',
            },
            {
                condition: 'If Real 10Y ≤ 0%:',
                title: '🏆 Rotate to Gold / Real Assets',
                description: 'Both equities and bonds fail in real terms',
                note: 'Late 1970s (high inflation, low real earnings, negative real bond yields)',
            },
        ],
        examples: [],
        insight: '',
    },
    'growth-regime': {
        emoji: '🚀',
        title: 'Growth Regime',
        titleColor: 'text-purple-700 dark:text-purple-400',
        subtitle: 'Fourth priority - when EYP is negative but yield curve is positive',
        category: {
            name: '🟩 Risk-On / Conditional Equity',
            color: 'text-green-600 dark:text-green-400',
            description: 'Liquidity supports duration → High-growth equities',
        },
        trigger: ['Real 10Y ≥ 0% (no System Stress)', 'AND Real EY ≥ 0% (equities not broken)', 'AND EYP < -1% (equity carry inferior to bonds)', '', 'EYP < -1% AND Yield Curve > 0%'],
        meaning: [
            'Equity cash-flow carry is inferior to bonds',
            'But liquidity transmission is healthy',
            'Duration can be financed and carried',
            'Growth compensates for weak near-term earnings',
        ],
        rotation: {
            title: 'Growth Equities',
            description: 'High-growth / long-duration equities',
            bullets: [
                'Positive yield curve enables financing',
                'Duration assets can be carried',
                'Growth premium compensates for weak carry',
            ],
        },
        note: 'This is NOT a bond-favored regime despite negative EYP. The positive yield curve changes the calculus entirely.',
        examples: [
            '1994-1999 (tech boom with positive curve)',
            '2017-2018 (FAANG dominance)',
        ],
        insight: 'A positive yield curve indicates healthy liquidity transmission. Even though current equity earnings are expensive, the ability to finance duration means growth assets can be carried until their future cash flows materialize.',
    },
    'equity-value': {
        emoji: '💎',
        title: 'Equity Value Window',
        titleColor: 'text-green-700 dark:text-green-400',
        subtitle: 'Fifth priority - attractive equity valuations',
        category: {
            name: '🟩 Risk-On / Strong Buy',
            color: 'text-green-600 dark:text-green-400',
            description: 'Real EY ≥ +3.0% → BUY equities (broad exposure)',
        },
        trigger: ['Real EY ≥ +3.0% (Good Value)', 'Real EY ≥ +5.0% (Extreme Value)'],
        meaning: [
            'Equities offer strong real earnings cushion',
            'Valuations provide downside protection',
            'Long-term equity ownership economically justified',
            'Timing precision is less important; expectancy is high',
        ],
        rotations: [
            {
                condition: '🟢 Good Value (Real EY ≥ +3.0%):',
                title: 'BUY Equities',
                description: 'Valuations attractive, but not distressed. Long-term real returns are favorable. Broad participation likely over time.',
                note: 'Standard high-conviction BUY regime',
            },
            {
                condition: '🟢🟢 Extreme Value (Real EY ≥ +5.0%):',
                title: 'STRONG BUY Equities',
                description: 'Equity valuations severely compressed. Pessimism elevated; risk premia unusually wide. Long-term real returns historically exceptional.',
                note: 'Rare, crisis-level opportunity (post-crash, forced selling, regime resets)',
            },
        ],
        note: 'This is a permission regime, not a timing signal. It does not imply a sell when the condition ends. When Real EY falls below +3%, the system simply returns to a normal equity regime. Negative equity regimes are triggered only by separate conditions (e.g., Real EY < 0, System Stress, Equity Danger).',
        examples: [
            '2009 (post-financial crisis - Extreme Value)',
            '1982 (end of stagflation - Extreme Value)',
            '2020 March (COVID panic - Extreme Value)',
            '2011 (European debt crisis - Good Value)',
        ],
        insight: 'This regime identifies periods when equity valuations are attractive enough that long-term expected returns are high. The two levels distinguish between standard opportunities (Good Value) and rare, crisis-driven extremes (Extreme Value).',
    },
    'equity-danger': {
        emoji: '⚠️',
        title: 'Equity Danger Regime',
        titleColor: 'text-red-700 dark:text-red-400',
        subtitle: 'Third priority - when EYP is negative and yield curve is inverted',
        category: {
            name: '🟥 Risk-Off / Defensive',
            color: 'text-red-600 dark:text-red-400',
            description: 'Liquidity broken → Bonds or gold',
        },
        trigger: ['Real 10Y ≥ 0% (no System Stress)', 'AND Real EY ≥ 0% (equities not broken)', 'AND EYP < -1% (equity carry inferior to bonds)', '', 'EYP < -1% AND Yield Curve < 0%'],
        meaning: [
            'Equity carry is inferior to bonds',
            'Liquidity transmission is broken',
            'Growth cannot be financed',
            'Equity risk is poorly compensated',
        ],
        rotations: [
            {
                condition: 'If Real 10Y > 0%:',
                title: 'Rotate to Bonds',
                description: 'Bonds offer positive real yield with lower risk',
                note: 'Inverted curve signals stress ahead',
            },
            {
                condition: 'If Real 10Y ≤ 0%:',
                title: 'Rotate to Gold / Real Assets',
                description: 'Both equities and bonds under stress',
                note: 'Real assets preserve purchasing power',
            },
        ],
        examples: [
            '2000 (dot-com peak with inverted curve)',
            '2006-2007 (pre-financial crisis)',
            '2022 (Fed tightening cycle)',
        ],
        insight: 'Expensive equities + inverted curve means current earnings don\'t justify valuations AND future growth cannot be financed.',
    },
    'normal': {
        emoji: '✅',
        title: 'Normal Regime',
        titleColor: 'text-green-700 dark:text-green-400',
        subtitle: 'Default state - when no stress signals are active',
        category: {
            name: '🟩 Risk-On / Balanced',
            color: 'text-green-600 dark:text-green-400',
            description: 'All metrics healthy → Balanced portfolio',
        },
        trigger: ['Real 10Y ≥ 0%', 'AND Real EY ≥ 0%', 'AND (EYP ≥ -1% OR no clear fork signal)', 'AND Real EY ≤ +3.0%'],
        meaning: [
            'Financial system functioning normally',
            'Risk-free rate provides real return',
            'Equities compensate for inflation',
            'Standard asset allocation applies',
        ],
        rotation: {
            title: 'Balanced Portfolio',
            description: '',
            bullets: [
                'Diversified portfolio appropriate',
                'Risk assets can be held',
                'Normal risk/return tradeoffs apply',
                'No forced rotation required',
            ],
        },
        examples: [],
        insight: 'In Normal regime, traditional portfolio construction principles work well. Focus on diversification, rebalancing, and long-term goals.',
    },
};

function TabButton({ tab, isActive, onClick }: { tab: TabData; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${isActive
                ? 'border-b-2 border-primary text-foreground bg-muted/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }`}
        >
            {tab.label}
        </button>
    );
}

function RegimeTab({ content }: { content: RegimeTabContent }) {
    return (
        <div className="space-y-6">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{content.emoji}</span>
                        <div>
                            <h3 className={`text-xl font-bold ${content.titleColor}`}>{content.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{content.subtitle}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-semibold ${content.category.color}`}>{content.category.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{content.category.description}</div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold mb-2">{Array.isArray(content.trigger) && content.trigger.length > 3 ? 'Prerequisites' : 'Trigger Condition'}</h4>
                <div className="bg-muted/30 p-3 rounded font-mono text-sm space-y-1">
                    {Array.isArray(content.trigger) ? (
                        content.trigger.map((line, i) => <div key={i}>{line || '\u00A0'}</div>)
                    ) : (
                        <div>{content.trigger}</div>
                    )}
                </div>
            </div>

            {Array.isArray(content.trigger) && content.trigger.length > 3 && (
                <div>
                    <h4 className="font-semibold mb-2">Trigger Condition</h4>
                    <div className="bg-muted/30 p-3 rounded font-mono text-sm">
                        {content.trigger[content.trigger.length - 1]}
                    </div>
                </div>
            )}

            <div>
                <h4 className="font-semibold mb-2">What This Means</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {content.meaning.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {content.rotations && (
                <div>
                    <h4 className="font-semibold mb-3">
                        {content.rotations.some(r => r.condition) ? 'Recommended Rotation (depends on bonds)' : 'Recommended Rotation'}
                    </h4>
                    <div className="space-y-3">
                        {content.rotations.map((rotation, i) => (
                            <div key={i} className="bg-muted/30 border border-border rounded-lg p-4">
                                {rotation.condition && <p className="text-sm font-semibold mb-1">{rotation.condition}</p>}
                                <h4 className="font-semibold mb-2">{rotation.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{rotation.description}</p>
                                {rotation.note && <p className="text-xs text-muted-foreground"><span className="font-semibold">{rotation.condition ? 'Example' : 'When'}:</span> {rotation.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {content.rotation && (
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{content.rotation.title}</h4>
                    {content.rotation.description && <p className="text-sm text-muted-foreground mb-3">{content.rotation.description}</p>}
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {content.rotation.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span>•</span>
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {content.note && (
                <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <p className="text-sm">
                        <span className="font-semibold">Important:</span> {content.note}
                    </p>
                </div>
            )}

            {content.examples.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Historical Examples</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {content.examples.map((example, i) => (
                            <li key={i}>• {example}</li>
                        ))}
                    </ul>
                </div>
            )}

            {content.insight && (
                <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <p className="text-sm">
                        <span className="font-semibold">Why this {content.title.includes('Danger') ? 'is dangerous' : content.title.includes('Growth') ? 'works' : 'dominates'}:</span> {content.insight}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function RegimeModelModal({ isOpen, onClose }: RegimeModelModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-background border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
                    <h2 className="text-2xl font-bold">Regime Model Guide</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border flex-shrink-0 bg-background">
                    {/* Overview Tab */}
                    <div className="flex border-b border-border/50">
                        <TabButton
                            tab={TABS[0]}
                            isActive={activeTab === TABS[0].id}
                            onClick={() => setActiveTab(TABS[0].id)}
                        />
                    </div>

                    {/* Risk-Off Row */}
                    <div className="flex border-b border-border/50 overflow-x-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center bg-muted/20 border-r border-border/50">
                            🟥 Risk-Off
                        </div>
                        {TABS.slice(1, 4).map((tab) => (
                            <TabButton
                                key={tab.id}
                                tab={tab}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>

                    {/* Risk-On Row */}
                    <div className="flex overflow-x-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-green-600 dark:text-green-400 flex items-center bg-muted/20 border-r border-border/50">
                            🟩 Risk-On
                        </div>
                        {TABS.slice(4, 7).map((tab) => (
                            <TabButton
                                key={tab.id}
                                tab={tab}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-3">How the Regime Model Works</h3>
                                <p className="text-muted-foreground mb-4">
                                    The Regime Model evaluates market conditions in a hierarchical order to determine optimal asset allocation.
                                    Each regime takes precedence over those below it.
                                </p>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3">Detection Order (Priority)</h4>
                                <ol className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-red-600 dark:text-red-400">1.</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">System Stress</span>
                                                <span className="text-xs text-red-600 dark:text-red-400">🟥 Risk-Off</span>
                                            </div>
                                            <span className="text-muted-foreground text-xs">Real 10Y &lt; -0.5% → Gold / real assets</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-red-600 dark:text-red-400">2.</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Equities Adverse</span>
                                                <span className="text-xs text-red-600 dark:text-red-400">🟥 Risk-Off</span>
                                            </div>
                                            <span className="text-muted-foreground text-xs">Real EY &lt; 0% → Bonds or gold</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">3.</span>
                                        <div>
                                            <span className="font-semibold">Growth vs Equity Danger Fork</span>
                                            <div className="text-muted-foreground text-xs mt-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-600 dark:text-red-400">🟥 Danger:</span>
                                                    <span>EYP &lt; -1% + curve inverted → Bonds or gold</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 dark:text-green-400">🟩 Growth:</span>
                                                    <span>EYP &lt; -1% + curve positive → High-growth equities</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-green-600 dark:text-green-400">4.</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Equity Value Window</span>
                                                <span className="text-xs text-green-600 dark:text-green-400">🟩 Risk-On</span>
                                            </div>
                                            <div className="text-muted-foreground text-xs mt-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 dark:text-green-400">🟢 Good:</span>
                                                    <span>Real EY ≥ +3.0% → BUY equities</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600 dark:text-green-400">🟢🟢 Extreme:</span>
                                                    <span>Real EY ≥ +5.0% → STRONG BUY equities</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-green-600 dark:text-green-400">5.</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Normal</span>
                                                <span className="text-xs text-green-600 dark:text-green-400">🟩 Risk-On</span>
                                            </div>
                                            <span className="text-muted-foreground text-xs">All metrics healthy → Balanced portfolio</span>
                                        </div>
                                    </li>
                                </ol>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3">Regime Families</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="font-semibold text-red-600 dark:text-red-400 mb-1">🟥 Risk-Off / Defensive Family</div>
                                        <p className="text-xs text-muted-foreground mb-2">These regimes say: don't own equities broadly</p>
                                        <ul className="space-y-1 text-xs text-muted-foreground ml-4">
                                            <li>• System Stress, Equities Adverse, Equity Danger</li>
                                            <li>• Different causes, same directional bias</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-green-600 dark:text-green-400 mb-1">🟩 Risk-On / Conditional Equity Family</div>
                                        <p className="text-xs text-muted-foreground mb-2">These regimes support equity ownership</p>
                                        <ul className="space-y-1 text-xs text-muted-foreground ml-4">
                                            <li>• Growth Regime: Liquidity supports duration</li>
                                            <li>• Equity Value Window: Exceptional valuations justify accumulation</li>
                                            <li>• Normal: All metrics healthy</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Key Metrics</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="font-medium">Real 10Y</span>
                                        <span className="text-muted-foreground">10Y Treasury - CPI</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="font-medium">Real EY</span>
                                        <span className="text-muted-foreground">Earnings Yield (5yr) - CPI</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="font-medium">EYP</span>
                                        <span className="text-muted-foreground">Earnings Yield (5yr) - 3M Treasury</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="font-medium">Yield Curve</span>
                                        <span className="text-muted-foreground">10Y Treasury - 3M Treasury</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <RegimeTab content={REGIME_CONTENT[activeTab]} />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                        This model provides a framework for understanding market regimes. It should be used as one input among many in investment decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}
