//app/cftc/CftcPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import CftcTable from "./CftcTable";
import CftcChart from "./CftcChart";

export default function CftcPageClient() {
    const { theme } = useTheme();
    const dark = theme === "dark";

    const [data, setData] = useState([]);
    const [reportDate, setReportDate] = useState<string | null>(null);
    const [averages, setAverages] = useState<Record<string, { avgMMoneyPct: number; avgOtherPct: number; avgNonComPct: number; avgProdPct: number; avgSwapPct: number; avgComPct: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cftc")
            .then(r => r.json())
            .then(json => {
                setData(json.data ?? []);
                setReportDate(json.reportDate ?? null);
                setAverages(json.averages ?? {});
            })
            .finally(() => setLoading(false));
    }, []);

    const formattedDate = reportDate
        ? new Date(reportDate.slice(0, 10) + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : null;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-gradient-to-br from-slate-50 to-emerald-50"}`}>
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                        CFTC Commitments of Traders
                    </h1>
                    {formattedDate && (
                        <p className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                            Latest report: {formattedDate}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Loading...</div>
                ) : (
                    <div className="space-y-8">
                        <CftcChart />
                        <div className="overflow-x-auto">
                            <CftcTable rows={data} averages={averages} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
