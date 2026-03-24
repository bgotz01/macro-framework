'use client';

import { useState } from 'react';

export interface CustomThresholds {
    deepValue: { entry: number; exit: number };
    broadGrowth: { entry: number; exit: number };
    fragile: { entryRey: number; entryReal10Y: number; entryRealM2: number; exitReal10Y: number };
    contraction: { entryRey: number; entryEyp: number; entryReal10Y: number; exitRey: number };
    longDuration: { entryEyp: number; entryReal10Y: number; exitEypHigh: number; exitEypLow: number };
    overvaluation: { entry: number; exit: number };
    crisis: { entryReal10Y: number; entryRealM2: number; exitReal10Y: number; exitRealM2: number };
    bondStress: { entryReal10Y: number; entryReal3M: number; exitReal10Y: number };
    liquidityShock: { entry: number; exit: number };
}

export const DEFAULT_THRESHOLDS: CustomThresholds = {
    deepValue: { entry: 6, exit: 4 },
    broadGrowth: { entry: 3, exit: 1 },
    fragile: { entryRey: 0, entryReal10Y: 0, entryRealM2: 10, exitReal10Y: 1 },
    contraction: { entryRey: 0, entryEyp: 0, entryReal10Y: 0, exitRey: 2 },
    longDuration: { entryEyp: 0, entryReal10Y: 1, exitEypHigh: 0, exitEypLow: -2.5 },
    overvaluation: { entry: -2.5, exit: 0 },
    crisis: { entryReal10Y: -1, entryRealM2: 5, exitReal10Y: 0.5, exitRealM2: 7 },
    bondStress: { entryReal10Y: -0.5, entryReal3M: -1, exitReal10Y: 0.25 },
    liquidityShock: { entry: 10, exit: 8 },
};

interface Props {
    thresholds: CustomThresholds;
    onApply: (t: CustomThresholds) => void;
}

function ThresholdRow({ label, value, onChange, suffix = '%' }: {
    label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">{label}</label>
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    step="0.25"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs rounded border border-border bg-muted text-right focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground w-4">{suffix}</span>
            </div>
        </div>
    );
}

function RegimeSection({ title, color, children }: {
    title: string; color: string; children: React.ReactNode;
}) {
    return (
        <div className="p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <h4 className="text-sm font-semibold">{title}</h4>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

type Tab = 'liquidity' | 'valuation' | 'deterioration';

export default function CustomRegimeModal({ thresholds, onApply }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState<CustomThresholds>({ ...thresholds });
    const [activeTab, setActiveTab] = useState<Tab>('liquidity');

    const update = <K extends keyof CustomThresholds>(
        regime: K,
        field: keyof CustomThresholds[K],
        value: number
    ) => {
        setDraft(prev => ({
            ...prev,
            [regime]: { ...prev[regime], [field]: value }
        }));
    };

    const handleApply = () => {
        onApply(draft);
        setIsOpen(false);
    };

    const handleReset = () => {
        setDraft({ ...DEFAULT_THRESHOLDS });
    };

    return (
        <>
            <button
                onClick={() => { setDraft({ ...thresholds }); setIsOpen(true); }}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
                Configure Thresholds
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Custom Regime Thresholds</h2>
                                <p className="text-xs text-muted-foreground mt-1">Adjust entry/exit triggers, then run the engine</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border bg-muted/30">
                            {([
                                { key: 'liquidity' as Tab, label: 'Liquidity', desc: 'Real rates & money supply' },
                                { key: 'valuation' as Tab, label: 'Valuation', desc: 'Earnings yield & equity premium' },
                                { key: 'deterioration' as Tab, label: 'Deterioration', desc: 'Cross-dimension stress' },
                            ]).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                        ? 'bg-background text-foreground border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">{tab.desc}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6">
                            {activeTab === 'liquidity' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Regimes driven by real interest rates (Real 10Y, Real 3M) and real money supply growth (Real M2).
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <RegimeSection title="Liquidity Shock" color="#fbbf24">
                                            <ThresholdRow label="Entry: Real M2 ≥" value={draft.liquidityShock.entry} onChange={v => update('liquidityShock', 'entry', v)} />
                                            <ThresholdRow label="Exit: Real M2 ≤" value={draft.liquidityShock.exit} onChange={v => update('liquidityShock', 'exit', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Crisis" color="#991b1b">
                                            <ThresholdRow label="Entry: Real 10Y ≤" value={draft.crisis.entryReal10Y} onChange={v => update('crisis', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Entry: Real M2 ≤" value={draft.crisis.entryRealM2} onChange={v => update('crisis', 'entryRealM2', v)} />
                                            <ThresholdRow label="Exit: Real 10Y ≥" value={draft.crisis.exitReal10Y} onChange={v => update('crisis', 'exitReal10Y', v)} />
                                            <ThresholdRow label="Exit: Real M2 ≥" value={draft.crisis.exitRealM2} onChange={v => update('crisis', 'exitRealM2', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Bond Stress" color="#ea580c">
                                            <ThresholdRow label="Entry: Real 10Y ≤" value={draft.bondStress.entryReal10Y} onChange={v => update('bondStress', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Entry: Real 3M ≤" value={draft.bondStress.entryReal3M} onChange={v => update('bondStress', 'entryReal3M', v)} />
                                            <ThresholdRow label="Exit: Real 10Y ≥" value={draft.bondStress.exitReal10Y} onChange={v => update('bondStress', 'exitReal10Y', v)} />
                                        </RegimeSection>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'valuation' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Regimes driven by real earnings yield (REY) and earnings yield premium vs bonds (EYP).
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <RegimeSection title="Deep Value" color="#15803d">
                                            <ThresholdRow label="Entry: REY ≥" value={draft.deepValue.entry} onChange={v => update('deepValue', 'entry', v)} />
                                            <ThresholdRow label="Exit: REY <" value={draft.deepValue.exit} onChange={v => update('deepValue', 'exit', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Broad Growth" color="#22c55e">
                                            <ThresholdRow label="Entry: REY ≥" value={draft.broadGrowth.entry} onChange={v => update('broadGrowth', 'entry', v)} />
                                            <ThresholdRow label="Exit: REY <" value={draft.broadGrowth.exit} onChange={v => update('broadGrowth', 'exit', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Long Duration" color="#3b82f6">
                                            <ThresholdRow label="Entry: EYP ≤" value={draft.longDuration.entryEyp} onChange={v => update('longDuration', 'entryEyp', v)} />
                                            <ThresholdRow label="Entry: Real 10Y ≥" value={draft.longDuration.entryReal10Y} onChange={v => update('longDuration', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Exit: EYP ≥" value={draft.longDuration.exitEypHigh} onChange={v => update('longDuration', 'exitEypHigh', v)} />
                                            <ThresholdRow label="Exit: EYP ≤" value={draft.longDuration.exitEypLow} onChange={v => update('longDuration', 'exitEypLow', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Overvaluation" color="#eab308">
                                            <ThresholdRow label="Entry: EYP ≤" value={draft.overvaluation.entry} onChange={v => update('overvaluation', 'entry', v)} />
                                            <ThresholdRow label="Exit: EYP ≥" value={draft.overvaluation.exit} onChange={v => update('overvaluation', 'exit', v)} />
                                        </RegimeSection>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'deterioration' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Cross-dimension regimes where both valuation and liquidity conditions deteriorate together.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <RegimeSection title="Fragile" color="#f97316">
                                            <ThresholdRow label="Entry: REY ≤" value={draft.fragile.entryRey} onChange={v => update('fragile', 'entryRey', v)} />
                                            <ThresholdRow label="Entry: Real 10Y ≤" value={draft.fragile.entryReal10Y} onChange={v => update('fragile', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Entry: Real M2 <" value={draft.fragile.entryRealM2} onChange={v => update('fragile', 'entryRealM2', v)} />
                                            <ThresholdRow label="Exit: Real 10Y ≥" value={draft.fragile.exitReal10Y} onChange={v => update('fragile', 'exitReal10Y', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Contraction" color="#dc2626">
                                            <ThresholdRow label="Entry: REY ≤" value={draft.contraction.entryRey} onChange={v => update('contraction', 'entryRey', v)} />
                                            <ThresholdRow label="Entry: EYP ≤" value={draft.contraction.entryEyp} onChange={v => update('contraction', 'entryEyp', v)} />
                                            <ThresholdRow label="Entry: Real 10Y ≤" value={draft.contraction.entryReal10Y} onChange={v => update('contraction', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Exit: REY ≥" value={draft.contraction.exitRey} onChange={v => update('contraction', 'exitRey', v)} />
                                        </RegimeSection>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex items-center justify-between">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Reset to Defaults
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Apply & Run Engine
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
