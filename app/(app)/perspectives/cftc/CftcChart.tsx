//app/cftc/CftcChart.tsx
"use client";

import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

const COMMODITIES = [
    { value: "WTI_CRUDE_NYMEX", label: "WTI Crude (NYMEX)" },
    { value: "WTI_CRUDE_ICE", label: "WTI Crude (ICE)" },
    { value: "BRENT_CRUDE", label: "Brent Crude" },
    { value: "GASOLINE_RBOB", label: "Gasoline RBOB" },
    { value: "NY_HARBOR_ULSD", label: "NY Harbor ULSD" },
    { value: "NAT_GAS_HH", label: "Natural Gas (Henry Hub)" },
    { value: "GOLD", label: "Gold" },
    { value: "SILVER", label: "Silver" },
    { value: "COPPER", label: "Copper" },
    { value: "CORN", label: "Corn" },
    { value: "SOYBEANS", label: "Soybeans" },
    { value: "WHEAT_SRW", label: "Wheat SRW" },
    { value: "WHEAT_HRW", label: "Wheat HRW" },
    { value: "SOYBEAN_MEAL", label: "Soybean Meal" },
    { value: "SOYBEAN_OIL", label: "Soybean Oil" },
];

interface HistoryRow {
    reportDate: string;
    openInterest: number | null;
    mMoneyNet: number | null;
    mMoneyLong: number | null;
    mMoneyShort: number | null;
    prodMercNet: number | null;
    prodMercLong: number | null;
    prodMercShort: number | null;
    swapNet: number | null;
    otherNet: number | null;
    speculativeNet: number | null;
    commercialNet: number | null;
}

type ViewMode = "combined" | "breakdown" | "gross";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
    { value: "combined", label: "Non-Com vs Commercial" },
    { value: "breakdown", label: "Breakdown" },
    { value: "gross", label: "Long / Short" },
];

const NOTES: Record<ViewMode, { color: string; label: string; text: string }[]> = {
    combined: [
        { color: "bg-blue-500", label: "Non-Commercial Net (MM + Other)", text: "All speculative participants combined. Extreme readings are a contrarian signal." },
        { color: "bg-orange-500", label: "Commercial Net (Prod/Merc + Swap)", text: "True commercial position. When they cover aggressively, it signals bullish conviction from the informed side." },
    ],
    breakdown: [
        { color: "bg-blue-500", label: "MM Net", text: "Managed money (hedge funds, CTAs) net position. The most-watched speculative signal." },
        { color: "bg-yellow-500", label: "Other Net", text: "Smaller reportable traders — prop desks, smaller funds." },
        { color: "bg-orange-500", label: "Prod/Merc Net", text: "Producers and merchants hedging physical exposure. Typically net short." },
        { color: "bg-purple-500", label: "Swap Net", text: "Banks and dealers hedging OTC swap books." },
    ],
    gross: [
        { color: "bg-green-500", label: "MM Long", text: "Total speculator long contracts. Rising = growing bullish conviction." },
        { color: "bg-red-500", label: "MM Short", text: "Total speculator short contracts. Rising = funds betting on decline." },
        { color: "bg-yellow-500", label: "Prod Long", text: "Commercials buying futures — refiners locking in input costs." },
        { color: "bg-purple-500", label: "Prod Short", text: "Commercials selling futures to hedge future production." },
    ],
};

export default function CftcChart() {
    const [commodity, setCommodity] = useState("GOLD");
    const [rows, setRows] = useState<HistoryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("combined");
    const [pctMode, setPctMode] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

    const toggleLine = (key: string) =>
        setHiddenLines(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });

    useEffect(() => {
        setLoading(true);
        fetch(`/api/cftc/history?commodity=${commodity}`)
            .then(r => r.json())
            .then(json => setRows(json.data ?? []))
            .finally(() => setLoading(false));
    }, [commodity]);

    const scale = (v: number | null, oi: number | null) =>
        pctMode && v != null && oi ? v / oi * 100 : v;

    const chartData = rows.map(r => {
        const oi = r.openInterest;
        const base = {
            date: r.reportDate.slice(0, 10),
            nonCom: scale(r.speculativeNet, oi),
            commercial: scale(r.commercialNet, oi),
            mmNet: scale(r.mMoneyNet, oi),
            otherNet: scale(r.otherNet, oi),
            prodNet: scale(r.prodMercNet, oi),
            swapNet: scale(r.swapNet, oi),
            mmLong: scale(r.mMoneyLong, oi),
            mmShort: scale(r.mMoneyShort, oi),
            prodLong: scale(r.prodMercLong, oi),
            prodShort: scale(r.prodMercShort, oi),
        };
        return base;
    });

    const tickColor = "#9ca3af";
    const gridColor = "#374151";

    const btnBase = "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors";
    const btnActive = "bg-emerald-600 text-white";
    const btnInactive = "bg-muted text-muted-foreground hover:bg-muted/80";

    const fmtTick = (v: number) => pctMode ? `${v.toFixed(0)}%` : v.toLocaleString();
    const fmtTooltip = (v: number) => pctMode ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : `${v >= 0 ? "+" : ""}${v.toLocaleString()}`;

    const linesByMode: Record<ViewMode, { key: string; color: string; dashed?: boolean }[]> = {
        combined: [
            { key: "nonCom", color: "#3b82f6" },
            { key: "commercial", color: "#f97316" },
        ],
        breakdown: [
            { key: "mmNet", color: "#3b82f6" },
            { key: "otherNet", color: "#eab308", dashed: true },
            { key: "prodNet", color: "#f97316" },
            { key: "swapNet", color: "#a855f7", dashed: true },
        ],
        gross: [
            { key: "mmLong", color: "#22c55e" },
            { key: "mmShort", color: "#ef4444" },
            { key: "prodLong", color: "#eab308", dashed: true },
            { key: "prodShort", color: "#a855f7", dashed: true },
        ],
    };

    const labelMap: Record<string, string> = {
        nonCom: "Non-Commercial Net", commercial: "Commercial Net",
        mmNet: "MM Net", otherNet: "Other Net", prodNet: "Prod/Merc Net", swapNet: "Swap Net",
        mmLong: "MM Long", mmShort: "MM Short", prodLong: "Prod Long", prodShort: "Prod Short",
    };

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <select
                    value={commodity}
                    onChange={e => setCommodity(e.target.value)}
                    className="text-sm rounded-lg px-3 py-2 bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {COMMODITIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>

                <div className="flex gap-1">
                    {VIEW_MODES.map(m => (
                        <button key={m.value} className={`${btnBase} ${viewMode === m.value ? btnActive : btnInactive}`} onClick={() => { setViewMode(m.value); setHiddenLines(new Set()); }}>
                            {m.label}
                        </button>
                    ))}
                </div>

                <button className={`${btnBase} ml-auto ${pctMode ? btnActive : btnInactive}`} onClick={() => setPctMode(p => !p)}>
                    % of OI
                </button>
            </div>

            {/* Metric toggles */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {linesByMode[viewMode].map(l => {
                    const active = !hiddenLines.has(l.key);
                    return (
                        <button
                            key={l.key}
                            onClick={() => toggleLine(l.key)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${active ? "border-transparent text-white" : "border-border text-muted-foreground bg-muted/40 hover:bg-muted/70"}`}
                            style={active ? { backgroundColor: l.color } : {}}
                        >
                            <span
                                className="inline-block w-3 h-0.5 rounded"
                                style={{ backgroundColor: active ? "white" : l.color, ...(l.dashed ? { backgroundImage: "repeating-linear-gradient(90deg,currentColor 0,currentColor 3px,transparent 3px,transparent 6px)", backgroundColor: "transparent", borderTop: `2px dashed ${active ? "white" : l.color}`, height: 0 } : {}) }}
                            />
                            {labelMap[l.key]}
                        </button>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="h-80">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-muted-foreground">Loading...</div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-muted-foreground">No data</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: tickColor, fontSize: 11 }}
                                tickFormatter={v => {
                                    const d = new Date(v + "T12:00:00");
                                    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                                }}
                                interval="preserveStartEnd"
                                minTickGap={60}
                            />
                            <YAxis
                                tick={{ fill: tickColor, fontSize: 11 }}
                                tickFormatter={fmtTick}
                                width={70}
                            />
                            <ReferenceLine y={0} stroke="rgba(239,68,68,0.5)" strokeDasharray="6 4" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }}
                                labelStyle={{ color: '#9ca3af' }}
                                formatter={(value: number | undefined, name: string | undefined) => [value != null ? fmtTooltip(value) : "—", name ? (labelMap[name] ?? name) : ""]}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} formatter={name => labelMap[name] ?? name} />
                            {linesByMode[viewMode].filter(l => !hiddenLines.has(l.key)).map(l => (
                                <Line
                                    key={l.key}
                                    type="monotone"
                                    dataKey={l.key}
                                    stroke={l.color}
                                    strokeWidth={2}
                                    strokeDasharray={l.dashed ? "4 3" : undefined}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Notes */}
            <div className="mt-5 pt-4 border-t border-border/50">
                <button
                    onClick={() => setNotesOpen(o => !o)}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
                >
                    <span className={`inline-block transition-transform duration-200 ${notesOpen ? "rotate-90" : ""}`}>▶</span>
                    How to read this chart
                </button>
                {notesOpen && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                        {NOTES[viewMode].map(n => (
                            <div key={n.label} className="flex gap-2">
                                <span className={`mt-0.5 w-2.5 h-2.5 rounded-full ${n.color} shrink-0`} />
                                <span>
                                    <span className="font-medium text-card-foreground">{n.label}</span>
                                    {" — "}{n.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
