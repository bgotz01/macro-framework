//app/cftc/CftcTable.tsx
"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface CotRow {
    id: number;
    commodity: string;
    reportDate: string;
    openInterest: number | null;
    mMoneyNet: number | null;
    otherNet: number | null;
    speculativeNet: number | null;
    prodMercNet: number | null;
    swapNet: number | null;
    commercialNet: number | null;
    changeMMoneyLong: number | null;
    changeMMoneyShort: number | null;
    changeOtherLong: number | null;
    changeOtherShort: number | null;
    changeProdMercLong: number | null;
    changeProdMercShort: number | null;
    changeSwapLong: number | null;
    changeSwapShort: number | null;
}

const LABELS: Record<string, string> = {
    WTI_CRUDE_NYMEX: "WTI Crude (NYMEX)",
    WTI_CRUDE_ICE: "WTI Crude (ICE)",
    BRENT_CRUDE: "Brent Crude",
    GASOLINE_RBOB: "Gasoline RBOB",
    NY_HARBOR_ULSD: "NY Harbor ULSD",
    NAT_GAS_HH: "Natural Gas (HH)",
    GOLD: "Gold",
    SILVER: "Silver",
    COPPER: "Copper",
    CORN: "Corn",
    SOYBEANS: "Soybeans",
    WHEAT_SRW: "Wheat SRW",
    WHEAT_HRW: "Wheat HRW",
    SOYBEAN_MEAL: "Soybean Meal",
    SOYBEAN_OIL: "Soybean Oil",
};

const GROUPS = [
    { label: "Energy", keys: ["WTI_CRUDE_NYMEX", "WTI_CRUDE_ICE", "BRENT_CRUDE", "GASOLINE_RBOB", "NY_HARBOR_ULSD", "NAT_GAS_HH"] },
    { label: "Metals", keys: ["GOLD", "SILVER", "COPPER"] },
    { label: "Grains", keys: ["CORN", "SOYBEANS", "WHEAT_SRW", "WHEAT_HRW", "SOYBEAN_MEAL", "SOYBEAN_OIL"] },
];

type DisplayMode = "values" | "pct" | "change" | "vsAvg";

const MODES: { value: DisplayMode; label: string }[] = [
    { value: "values", label: "Net Positions" },
    { value: "pct", label: "% of OI" },
    { value: "change", label: "Week Change" },
    { value: "vsAvg", label: "% vs Avg" },
];

function pctVsAvg(current: number | null, oi: number, avgPct: number): number | null {
    if (current == null || oi === 0) return null;
    return (current / oi * 100) - avgPct;
}

function getValues(r: CotRow, mode: DisplayMode, avg?: { avgMMoneyPct: number; avgOtherPct: number; avgNonComPct: number; avgProdPct: number; avgSwapPct: number; avgComPct: number }) {
    const oi = r.openInterest || 1;

    if (mode === "values") return {
        mm: r.mMoneyNet, other: r.otherNet, noncom: r.speculativeNet,
        prod: r.prodMercNet, swap: r.swapNet, com: r.commercialNet,
    };

    if (mode === "pct") return {
        mm: r.mMoneyNet != null ? r.mMoneyNet / oi * 100 : null,
        other: r.otherNet != null ? r.otherNet / oi * 100 : null,
        noncom: r.speculativeNet != null ? r.speculativeNet / oi * 100 : null,
        prod: r.prodMercNet != null ? r.prodMercNet / oi * 100 : null,
        swap: r.swapNet != null ? r.swapNet / oi * 100 : null,
        com: r.commercialNet != null ? r.commercialNet / oi * 100 : null,
    };

    if (mode === "vsAvg") return {
        mm: avg ? pctVsAvg(r.mMoneyNet, oi, avg.avgMMoneyPct) : null,
        other: avg ? pctVsAvg(r.otherNet, oi, avg.avgOtherPct) : null,
        noncom: avg ? pctVsAvg(r.speculativeNet, oi, avg.avgNonComPct) : null,
        prod: avg ? pctVsAvg(r.prodMercNet, oi, avg.avgProdPct) : null,
        swap: avg ? pctVsAvg(r.swapNet, oi, avg.avgSwapPct) : null,
        com: avg ? pctVsAvg(r.commercialNet, oi, avg.avgComPct) : null,
    };

    const mmChg = (r.changeMMoneyLong != null && r.changeMMoneyShort != null) ? r.changeMMoneyLong - r.changeMMoneyShort : null;
    const otherChg = (r.changeOtherLong != null && r.changeOtherShort != null) ? r.changeOtherLong - r.changeOtherShort : null;
    const prodChg = (r.changeProdMercLong != null && r.changeProdMercShort != null) ? r.changeProdMercLong - r.changeProdMercShort : null;
    const swapChg = (r.changeSwapLong != null && r.changeSwapShort != null) ? r.changeSwapLong - r.changeSwapShort : null;
    const noncomChg = (mmChg != null && otherChg != null) ? mmChg + otherChg : mmChg ?? otherChg;
    const comChg = (prodChg != null && swapChg != null) ? prodChg + swapChg : prodChg ?? swapChg;
    return { mm: mmChg, other: otherChg, noncom: noncomChg, prod: prodChg, swap: swapChg, com: comChg };
}

function Cell({ value, mode, dark }: { value: number | null; mode: DisplayMode; dark: boolean }) {
    if (value == null) return <span className={dark ? "text-gray-700" : "text-gray-300"}>—</span>;
    const pos = value >= 0;
    const color = pos
        ? dark ? "text-emerald-400" : "text-emerald-600"
        : dark ? "text-red-400" : "text-red-600";
    const prefix = pos ? "+" : "";
    if (mode === "pct") return <span className={`font-medium ${color}`}>{prefix}{value.toFixed(1)}%</span>;
    if (mode === "change") return <span className={color}>{pos ? "▲" : "▼"} {Math.abs(value).toLocaleString()}</span>;
    if (mode === "vsAvg") return <span className={`font-medium ${color}`}>{prefix}{value.toFixed(1)}%</span>;
    return <span className={`font-semibold ${color}`}>{prefix}{value.toLocaleString()}</span>;
}

function TotalCell({ value, mode, dark }: { value: number | null; mode: DisplayMode; dark: boolean }) {
    if (value == null) return <span className={dark ? "text-gray-700" : "text-gray-300"}>—</span>;
    const pos = value >= 0;
    const color = pos
        ? dark ? "text-emerald-300" : "text-emerald-700"
        : dark ? "text-red-300" : "text-red-700";
    const prefix = pos ? "+" : "";
    if (mode === "pct") return <span className={`font-bold ${color}`}>{prefix}{value.toFixed(1)}%</span>;
    if (mode === "change") return <span className={`font-bold ${color}`}>{pos ? "▲" : "▼"} {Math.abs(value).toLocaleString()}</span>;
    if (mode === "vsAvg") return <span className={`font-bold ${color}`}>{prefix}{value.toFixed(1)}%</span>;
    return <span className={`font-bold ${color}`}>{prefix}{value.toLocaleString()}</span>;
}

interface Props { rows: CotRow[]; averages: Record<string, { avgMMoneyPct: number; avgOtherPct: number; avgNonComPct: number; avgProdPct: number; avgSwapPct: number; avgComPct: number }> }

export default function CftcTable({ rows, averages }: Props) {
    const { theme } = useTheme();
    const dark = theme === "dark";
    const [mode, setMode] = useState<DisplayMode>("values");

    const byKey = Object.fromEntries(rows.map(r => [r.commodity, r]));
    const latestDate = rows[0]?.reportDate
        ? new Date(rows[0].reportDate.slice(0, 10) + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : null;

    const th = `px-3 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-muted-foreground`;
    const thR = `${th} text-right`;
    const td = `px-3 py-2 text-sm whitespace-nowrap text-card-foreground`;
    const trBase = `border-b border-border/50`;
    const groupHeader = `px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-muted/50 text-muted-foreground`;
    const btnBase = "px-3 py-1 text-xs font-medium rounded-lg transition-colors";
    const btnActive = "bg-emerald-600 text-white";
    const btnInactive = "bg-muted text-muted-foreground hover:bg-muted/80";
    const divider = `border-l border-border/50`;

    return (
        <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
                <span className="text-xs mr-1 text-muted-foreground">Show:</span>
                {MODES.map(m => (
                    <button key={m.value} onClick={() => setMode(m.value)} className={`${btnBase} ${mode === m.value ? btnActive : btnInactive}`}>
                        {m.label}
                    </button>
                ))}
                {latestDate && (
                    <span className="ml-auto text-xs text-muted-foreground">Report date: {latestDate}</span>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr className="border-b border-border/50">
                            <th className={th} rowSpan={2}>Commodity</th>
                            <th className={thR} rowSpan={2}>OI</th>
                            <th colSpan={3} className={`${thR} text-blue-500 border-l border-border/50`}>Non-Commercial</th>
                            <th colSpan={3} className={`${thR} text-orange-500 border-l border-border/50`}>Commercial</th>
                        </tr>
                        <tr>
                            <th className={`${thR} ${divider}`}>Mgd Money</th>
                            <th className={thR}>Other</th>
                            <th className={`${thR} font-bold`}>Total</th>
                            <th className={`${thR} ${divider}`}>Prod/Merc</th>
                            <th className={thR}>Swap</th>
                            <th className={`${thR} font-bold`}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {GROUPS.map(group => (
                            <React.Fragment key={group.label}>
                                <tr>
                                    <td colSpan={8} className={groupHeader}>{group.label}</td>
                                </tr>
                                {group.keys.map(key => {
                                    const r = byKey[key];
                                    if (!r) return null;
                                    const v = getValues(r, mode, averages[r.commodity]);
                                    return (
                                        <tr key={key} className={`${trBase} transition-colors hover:bg-muted/30`}>
                                            <td className={`${td} font-medium`}>{LABELS[key] ?? key}</td>
                                            <td className={`${td} text-right text-muted-foreground`}>{r.openInterest?.toLocaleString() ?? "—"}</td>
                                            <td className={`${td} text-right ${divider}`}><Cell value={v.mm} mode={mode} dark={dark} /></td>
                                            <td className={`${td} text-right`}><Cell value={v.other} mode={mode} dark={dark} /></td>
                                            <td className={`${td} text-right`}><TotalCell value={v.noncom} mode={mode} dark={dark} /></td>
                                            <td className={`${td} text-right ${divider}`}><Cell value={v.prod} mode={mode} dark={dark} /></td>
                                            <td className={`${td} text-right`}><Cell value={v.swap} mode={mode} dark={dark} /></td>
                                            <td className={`${td} text-right`}><TotalCell value={v.com} mode={mode} dark={dark} /></td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
