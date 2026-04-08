'use client';

import { useState, useEffect } from 'react';

export interface CustomRegimeDef {
    name: string;
    color: string;
    precedence: number; // 1 = highest, inserted into the order at this position
    entryLogic: 'AND' | 'OR';
    exitLogic: 'AND' | 'OR';
    entry: {
        rey: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        eyp: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        real10Y: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        real3M: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        realM2: { enabled: boolean; op: 'lte' | 'gte'; value: number };
    };
    exit: {
        rey: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        eyp: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        real10Y: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        real3M: { enabled: boolean; op: 'lte' | 'gte'; value: number };
        realM2: { enabled: boolean; op: 'lte' | 'gte'; value: number };
    };
}

export interface CustomThresholds {
    broadGrowth: { entry: number; exit: number };
    longDuration: { entryEyp: number; entryReal10Y: number; entryRey: number; exitEypHigh: number; exitEypLow: number; exitRey: number };
    overvaluation: { entryEyp: number; entryRey: number; exitEyp: number; exitRey: number };
    crisis: { entryReal10Y: number; entryRealM2: number; exitReal10Y: number; exitRealM2: number };
    bondStress: { entryReal10Y: number; entryReal3M: number; exitReal10Y: number };
    liquidityShock: { entry: number; exit: number };
    customRegime: CustomRegimeDef;
}

const DEFAULT_CUSTOM_REGIME: CustomRegimeDef = {
    name: 'Custom',
    color: '#06b6d4',
    precedence: 5,
    entryLogic: 'AND',
    exitLogic: 'AND',
    entry: {
        rey: { enabled: false, op: 'gte', value: 50 },
        eyp: { enabled: false, op: 'gte', value: 50 },
        real10Y: { enabled: true, op: 'gte', value: 50 },
        real3M: { enabled: false, op: 'gte', value: 50 },
        realM2: { enabled: false, op: 'gte', value: 50 },
    },
    exit: {
        rey: { enabled: false, op: 'lte', value: 40 },
        eyp: { enabled: false, op: 'lte', value: 40 },
        real10Y: { enabled: true, op: 'lte', value: 40 },
        real3M: { enabled: false, op: 'lte', value: 40 },
        realM2: { enabled: false, op: 'lte', value: 40 },
    },
};

export const DEFAULT_THRESHOLDS: CustomThresholds = {
    broadGrowth: { entry: 3, exit: 1 },
    longDuration: { entryEyp: 0, entryReal10Y: 1, entryRey: 0, exitEypHigh: 0, exitEypLow: -2.5, exitRey: -0.5 },
    overvaluation: { entryEyp: -2.5, entryRey: -0.5, exitEyp: 0, exitRey: 0.5 },
    crisis: { entryReal10Y: -1, entryRealM2: 5, exitReal10Y: 0.5, exitRealM2: 7 },
    bondStress: { entryReal10Y: -0.5, entryReal3M: -1, exitReal10Y: 0.25 },
    liquidityShock: { entry: 10, exit: 8 },
    customRegime: DEFAULT_CUSTOM_REGIME,
};

interface Props {
    thresholds: CustomThresholds;
    onApply: (t: CustomThresholds) => void;
}

function ThresholdRow({ label, value, onChange, suffix = '%' }: {
    label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) {
    const [localValue, setLocalValue] = useState<string>(String(value));

    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    const commit = () => {
        const parsed = parseFloat(localValue);
        onChange(isNaN(parsed) ? 0 : parsed);
    };

    const labelColor = label.startsWith('Entry')
        ? 'text-green-600 dark:text-green-400'
        : label.startsWith('Exit')
            ? 'text-red-600 dark:text-red-400'
            : 'text-muted-foreground';

    return (
        <div className="flex items-center justify-between gap-3">
            <label className={`text-xs whitespace-nowrap font-medium ${labelColor}`}>{label}</label>
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    step="0.25"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={commit}
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

const CUSTOM_METRICS: { key: keyof CustomRegimeDef['entry']; label: string }[] = [
    { key: 'rey', label: 'REY (Real EY 5yr)' },
    { key: 'eyp', label: 'EYP (EY Premium 5yr)' },
    { key: 'real10Y', label: 'Real 10Y' },
    { key: 'real3M', label: 'Real 3M' },
    { key: 'realM2', label: 'Real M2 YoY' },
];

function CondRow({ side, metric, label, cond, onChange }: {
    side: 'entry' | 'exit';
    metric: keyof CustomRegimeDef['entry'];
    label: string;
    cond: { enabled: boolean; op: 'lte' | 'gte'; value: number };
    onChange: (patch: Partial<{ enabled: boolean; op: 'lte' | 'gte'; value: number }>) => void;
}) {
    const [localVal, setLocalVal] = useState(String(cond.value));
    useEffect(() => { setLocalVal(String(cond.value)); }, [cond.value]);

    return (
        <div className={`flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0 ${!cond.enabled ? 'opacity-40' : ''}`}>
            <input type="checkbox" checked={cond.enabled} onChange={e => onChange({ enabled: e.target.checked })} className="rounded" />
            <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
            <select value={cond.op} onChange={e => onChange({ op: e.target.value as 'lte' | 'gte' })}
                disabled={!cond.enabled}
                className="text-xs bg-muted border border-border rounded px-1.5 py-1 focus:outline-none">
                <option value="lte">≤</option>
                <option value="gte">≥</option>
            </select>
            <input
                type="number" step="0.25"
                value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                onBlur={() => { const v = parseFloat(localVal); if (!isNaN(v)) onChange({ value: v }); }}
                disabled={!cond.enabled}
                className="w-20 px-2 py-1 text-xs rounded border border-border bg-muted text-right focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">%</span>
        </div>
    );
}

type Tab = 'liquidity' | 'valuation' | 'deterioration' | 'custom';

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
                                { key: 'custom' as Tab, label: 'Custom', desc: 'User-defined regime' },
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
                                        <RegimeSection title="Broad Growth" color="#22c55e">
                                            <ThresholdRow label="Entry: REY ≥" value={draft.broadGrowth.entry} onChange={v => update('broadGrowth', 'entry', v)} />
                                            <ThresholdRow label="Exit: REY <" value={draft.broadGrowth.exit} onChange={v => update('broadGrowth', 'exit', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Long Duration" color="#3b82f6">
                                            <ThresholdRow label="Entry: EYP ≤" value={draft.longDuration.entryEyp} onChange={v => update('longDuration', 'entryEyp', v)} />
                                            <ThresholdRow label="Entry: Real 10Y ≥" value={draft.longDuration.entryReal10Y} onChange={v => update('longDuration', 'entryReal10Y', v)} />
                                            <ThresholdRow label="Entry: REY ≥" value={draft.longDuration.entryRey} onChange={v => update('longDuration', 'entryRey', v)} />
                                            <ThresholdRow label="Exit: EYP ≥" value={draft.longDuration.exitEypHigh} onChange={v => update('longDuration', 'exitEypHigh', v)} />
                                            <ThresholdRow label="Exit: EYP ≤" value={draft.longDuration.exitEypLow} onChange={v => update('longDuration', 'exitEypLow', v)} />
                                            <ThresholdRow label="Exit: REY <" value={draft.longDuration.exitRey} onChange={v => update('longDuration', 'exitRey', v)} />
                                        </RegimeSection>

                                        <RegimeSection title="Overvaluation" color="#eab308">
                                            <ThresholdRow label="Entry: EYP ≤" value={draft.overvaluation.entryEyp} onChange={v => update('overvaluation', 'entryEyp', v)} />
                                            <ThresholdRow label="Entry: REY ≤" value={draft.overvaluation.entryRey} onChange={v => update('overvaluation', 'entryRey', v)} />
                                            <ThresholdRow label="Exit: EYP ≥" value={draft.overvaluation.exitEyp} onChange={v => update('overvaluation', 'exitEyp', v)} />
                                            <ThresholdRow label="Exit: REY ≥" value={draft.overvaluation.exitRey} onChange={v => update('overvaluation', 'exitRey', v)} />
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
                                    </div>
                                </div>
                            )}

                            {activeTab === 'custom' && (() => {
                                const cr = draft.customRegime;
                                const updateCR = (patch: Partial<CustomRegimeDef>) =>
                                    setDraft(prev => ({ ...prev, customRegime: { ...prev.customRegime, ...patch } }));
                                const updateCond = (side: 'entry' | 'exit', metric: keyof CustomRegimeDef['entry'], patch: Partial<{ enabled: boolean; op: 'lte' | 'gte'; value: number }>) =>
                                    setDraft(prev => ({
                                        ...prev,
                                        customRegime: {
                                            ...prev.customRegime,
                                            [side]: { ...prev.customRegime[side], [metric]: { ...prev.customRegime[side][metric], ...patch } }
                                        }
                                    }));

                                return (
                                    <div className="space-y-5">
                                        {/* Identity */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground block mb-1">Regime Name</label>
                                                <input type="text" value={cr.name} onChange={e => updateCR({ name: e.target.value })}
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-border bg-muted focus:outline-none focus:ring-1 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground block mb-1">Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={cr.color} onChange={e => updateCR({ color: e.target.value })}
                                                        className="w-10 h-8 rounded border border-border cursor-pointer" />
                                                    <span className="text-xs font-mono text-muted-foreground">{cr.color}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Precedence */}
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">
                                                Precedence position <span className="text-muted-foreground/60">(1 = highest priority, 8 = lowest)</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input type="range" min={1} max={8} value={cr.precedence}
                                                    onChange={e => updateCR({ precedence: parseInt(e.target.value) })}
                                                    className="flex-1" />
                                                <span className="text-sm font-mono w-6 text-center">{cr.precedence}</span>
                                            </div>
                                        </div>

                                        {/* Entry conditions */}
                                        <div className="p-3 rounded-lg border border-border bg-card">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Entry Conditions</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-muted-foreground">Logic:</span>
                                                    {(['AND', 'OR'] as const).map(l => (
                                                        <button key={l} onClick={() => updateCR({ entryLogic: l })}
                                                            className={`text-xs px-2 py-0.5 rounded ${cr.entryLogic === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {CUSTOM_METRICS.map(m => (
                                                <CondRow key={m.key} side="entry" metric={m.key} label={m.label}
                                                    cond={cr.entry[m.key]}
                                                    onChange={patch => updateCond('entry', m.key, patch)} />
                                            ))}
                                        </div>

                                        {/* Exit conditions */}
                                        <div className="p-3 rounded-lg border border-border bg-card">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Exit Conditions</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-muted-foreground">Logic:</span>
                                                    {(['AND', 'OR'] as const).map(l => (
                                                        <button key={l} onClick={() => updateCR({ exitLogic: l })}
                                                            className={`text-xs px-2 py-0.5 rounded ${cr.exitLogic === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                            {l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {CUSTOM_METRICS.map(m => (
                                                <CondRow key={m.key} side="exit" metric={m.key} label={m.label}
                                                    cond={cr.exit[m.key]}
                                                    onChange={patch => updateCond('exit', m.key, patch)} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
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
