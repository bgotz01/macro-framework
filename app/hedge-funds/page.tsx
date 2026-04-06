'use client';

import { useState } from 'react';

const hedgeFunds = [
    { name: 'Melqart Opportunities', strategy: 'Event-Driven', return2025: 45.1 },
    { name: 'Bridgewater Asia', strategy: 'Macro', return2025: 37 },
    { name: 'Bridgewater Pure Alpha II', strategy: 'Macro', return2025: 34 },
    { name: 'Bridgewater China', strategy: 'Macro', return2025: 34 },
    { name: 'DE Shaw Oculus', strategy: 'Multistrategy', return2025: 28.2 },
    { name: 'Anson Investments Master', strategy: 'Equity', return2025: 21.2 },
    { name: 'Bridgewater All Weather', strategy: 'Risk Parity', return2025: 20 },
    { name: 'DE Shaw Composite', strategy: 'Multistrategy', return2025: 18.5 },
    { name: 'ExodusPoint', strategy: 'Multistrategy', return2025: 18.04 },
    { name: 'Kite Lake Special Opportunities', strategy: 'Event-Driven', return2025: 17.9 },
    { name: 'Schonfeld Fundamental Equity', strategy: 'Multimanager equity', return2025: 16 },
    { name: 'Walleye', strategy: 'Multistrategy', return2025: 15.5 },
    { name: 'LMR Partners', strategy: 'Multistrategy', return2025: 13.5 },
    { name: 'Schonfeld Strategic Partners', strategy: 'Multistrategy', return2025: 12.1 },
    { name: 'Marshall Wace', strategy: 'Eureka / Equity Long/Short', return2025: 11.6 },
    { name: 'Pinpoint Multi-Strategy', strategy: 'Multistrategy', return2025: 11.6 },
    { name: 'Bridgewater AIA', strategy: 'Quant Macro', return2025: 11 },
    { name: 'Taula', strategy: 'Macro', return2025: 11 },
    { name: 'Millennium', strategy: 'Multistrategy', return2025: 10.5 },
    { name: 'New Holland Tactical Alpha', strategy: 'Multistrategy', return2025: 9.8 },
    { name: 'Winton', strategy: 'Quant multistrategy', return2025: 7.4 },
];

const strategyColors: Record<string, string> = {
    'Macro': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Quant Macro': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Multistrategy': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Multimanager equity': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Quant multistrategy': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Event-Driven': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Equity': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Eureka / Equity Long/Short': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Risk Parity': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const topManagers = [
    { rank2024: 1, rank2025: 1, manager: 'Citadel', pms: 'Ken Griffin', aum: 65.9, netGains: 90.4, gains2025: 7.4, inception: 1990 },
    { rank2024: 2, rank2025: 2, manager: 'DE Shaw', pms: 'Various', aum: 72.4, netGains: 79.9, gains2025: 12.7, inception: 1988 },
    { rank2024: 4, rank2025: 3, manager: 'Bridgewater', pms: 'Ray Dalio / Various', aum: 76.9, netGains: 79.1, gains2025: 15.6, inception: 1975 },
    { rank2024: 3, rank2025: 4, manager: 'Millennium', pms: 'Israel Englander', aum: 85.0, netGains: 73.4, gains2025: 7.9, inception: 1989 },
    { rank2024: 6, rank2025: 5, manager: 'TCI', pms: 'Sir Christopher Hohn', aum: 77.1, netGains: 68.4, gains2025: 18.9, inception: 2004 },
    { rank2024: 5, rank2025: 6, manager: 'Elliott', pms: 'Paul Singer', aum: 80.0, netGains: 59.5, gains2025: 5.7, inception: 1977 },
    { rank2024: 7, rank2025: 7, manager: 'Viking', pms: 'Andreas Halvorsen', aum: 38.3, netGains: 48.6, gains2025: 4.1, inception: 1999 },
    { rank2024: 9, rank2025: 8, manager: 'Farallon', pms: 'Tom Steyer / Andrew Spokes / Nicolas Giaque', aum: 45.3, netGains: 45.8, gains2025: 4.8, inception: 1987 },
    { rank2024: 10, rank2025: 9, manager: 'Lone Pine', pms: 'Steve Mandel', aum: 19.2, netGains: 44.9, gains2025: 4.3, inception: 1996 },
    { rank2024: 8, rank2025: 10, manager: 'Soros*', pms: 'George Soros', aum: null, netGains: 43.9, gains2025: null, inception: 1973 },
    { rank2024: 12, rank2025: 11, manager: 'SAC/Point 72', pms: 'Steve Cohen', aum: 43.0, netGains: 43.3, gains2025: 5.3, inception: 1992 },
    { rank2024: 11, rank2025: 12, manager: 'Baupost', pms: 'Seth Klarman', aum: 24.4, netGains: 41.9, gains2025: 2.8, inception: 1983 },
    { rank2024: 13, rank2025: 13, manager: 'Appaloosa', pms: 'David Tepper', aum: 17.6, netGains: 41.0, gains2025: 4.1, inception: 1993 },
    { rank2024: 14, rank2025: 14, manager: 'Och Ziff / Sculptor', pms: 'Daniel Och / Jimmy Levin', aum: 38.0, netGains: 37.5, gains2025: 2.0, inception: 1994 },
    { rank2024: 16, rank2025: 15, manager: 'Marshall Wace', pms: 'Paul Marshall / Ian Wace', aum: 44.7, netGains: 35.4, gains2025: 5.9, inception: 1997 },
    { rank2024: 17, rank2025: 16, manager: 'Egerton', pms: 'John Armitage', aum: 19.0, netGains: 30.9, gains2025: 3.8, inception: 1995 },
    { rank2024: 15, rank2025: 17, manager: 'Brevan Howard', pms: 'Alan Howard', aum: 34.6, netGains: 30.6, gains2025: 0.1, inception: 2003 },
    { rank2024: 18, rank2025: 18, manager: 'Davidson Kempner', pms: 'Marvin Davidson / Thomas Kempner / Anthony Yoseloff', aum: 38.0, netGains: 28.9, gains2025: 4.4, inception: 1983 },
    { rank2024: 20, rank2025: 19, manager: 'Pershing Square', pms: 'Bill Ackman', aum: 20.6, netGains: 23.3, gains2025: 3.1, inception: 2004 },
    { rank2024: 19, rank2025: 20, manager: 'Caxton', pms: 'Bruce Kovner / Andrew Law', aum: 19.8, netGains: 23.1, gains2025: 2.9, inception: 1983 },
];

type ManagerSortKey = 'rank2025' | 'aum' | 'netGains' | 'gains2025' | 'inception';
type ReturnsSortKey = 'return2025';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
    return (
        <span className={`ml-1 text-xs ${active ? 'text-foreground' : 'text-muted-foreground/40'}`}>
            {dir === 'asc' ? '↑' : '↓'}
        </span>
    );
}

function rankDelta(r2024: number, r2025: number) {
    const diff = r2024 - r2025;
    if (diff > 0) return <span className="text-green-400 text-xs">▲{diff}</span>;
    if (diff < 0) return <span className="text-red-400 text-xs">▼{Math.abs(diff)}</span>;
    return <span className="text-muted-foreground text-xs">—</span>;
}

export default function HedgeFundsPage() {
    const [returnSort, setReturnSort] = useState<{ key: ReturnsSortKey; dir: 'asc' | 'desc' }>({ key: 'return2025', dir: 'desc' });
    const [managerSort, setManagerSort] = useState<{ key: ManagerSortKey; dir: 'asc' | 'desc' }>({ key: 'rank2025', dir: 'asc' });

    function toggleReturnSort(key: ReturnsSortKey) {
        setReturnSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    }

    function toggleManagerSort(key: ManagerSortKey) {
        setManagerSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
    }

    const sortedFunds = [...hedgeFunds].sort((a, b) => {
        const mul = returnSort.dir === 'asc' ? 1 : -1;
        return (a[returnSort.key] - b[returnSort.key]) * mul;
    });

    const sortedManagers = [...topManagers].sort((a, b) => {
        const mul = managerSort.dir === 'asc' ? 1 : -1;
        const av = a[managerSort.key] ?? -Infinity;
        const bv = b[managerSort.key] ?? -Infinity;
        return (Number(av) - Number(bv)) * mul;
    });

    const thClass = 'px-4 py-3 font-semibold text-muted-foreground select-none cursor-pointer hover:text-foreground transition-colors';

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Hedge Fund Returns</h1>
            <p className="text-muted-foreground mb-8">2025 YTD performance across major hedge funds</p>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8">#</th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Fund</th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Strategy</th>
                            <th className={`text-right ${thClass}`} onClick={() => toggleReturnSort('return2025')}>
                                2025 Return
                                <SortIcon active={returnSort.key === 'return2025'} dir={returnSort.dir} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFunds.map((fund, i) => (
                            <tr key={fund.name} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                <td className="px-4 py-3 font-medium">{fund.name}</td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${strategyColors[fund.strategy] ?? 'bg-muted text-muted-foreground border-border'}`}>
                                        {fund.strategy}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-green-400">
                                    +{fund.return2025}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-2 dark:text-white">Top 20 Managers by All-Time Net Gains</h2>
            <p className="text-muted-foreground mb-6">Ranked by cumulative net gains since inception, end of 2025</p>

            <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className={`text-left ${thClass}`} onClick={() => toggleManagerSort('rank2025')}>
                                2025 Rank
                                <SortIcon active={managerSort.key === 'rank2025'} dir={managerSort.dir} />
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">vs 2024</th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Manager</th>
                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Portfolio Manager(s)</th>
                            <th className={`text-right hidden md:table-cell ${thClass}`} onClick={() => toggleManagerSort('aum')}>
                                AUM ($bn)
                                <SortIcon active={managerSort.key === 'aum'} dir={managerSort.dir} />
                            </th>
                            <th className={`text-right ${thClass}`} onClick={() => toggleManagerSort('netGains')}>
                                Net Gains Since Inception ($bn)
                                <SortIcon active={managerSort.key === 'netGains'} dir={managerSort.dir} />
                            </th>
                            <th className={`text-right hidden sm:table-cell ${thClass}`} onClick={() => toggleManagerSort('gains2025')}>
                                2025 Gains ($bn)
                                <SortIcon active={managerSort.key === 'gains2025'} dir={managerSort.dir} />
                            </th>
                            <th className={`text-right hidden md:table-cell ${thClass}`} onClick={() => toggleManagerSort('inception')}>
                                Inception
                                <SortIcon active={managerSort.key === 'inception'} dir={managerSort.dir} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedManagers.map((m) => (
                            <tr key={m.manager} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground">{m.rank2025}</td>
                                <td className="px-4 py-3 hidden sm:table-cell">{rankDelta(m.rank2024, m.rank2025)}</td>
                                <td className="px-4 py-3 font-medium">{m.manager}</td>
                                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{m.pms}</td>
                                <td className="px-4 py-3 text-right hidden md:table-cell">{m.aum != null ? m.aum.toFixed(1) : 'n/a'}</td>
                                <td className="px-4 py-3 text-right font-semibold">{m.netGains.toFixed(1)}</td>
                                <td className="px-4 py-3 text-right hidden sm:table-cell text-green-400">{m.gains2025 != null ? m.gains2025.toFixed(1) : 'n/a'}</td>
                                <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{m.inception}</td>
                            </tr>
                        ))}
                        <tr className="border-t bg-muted/20 font-semibold">
                            <td colSpan={2} className="px-4 py-3 text-muted-foreground hidden sm:table-cell"></td>
                            <td className="px-4 py-3">Totals / Avg</td>
                            <td className="px-4 py-3 hidden lg:table-cell"></td>
                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                {topManagers.filter(m => m.aum != null).reduce((s, m) => s + m.aum!, 0).toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {topManagers.reduce((s, m) => s + m.netGains, 0).toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right hidden sm:table-cell text-green-400">
                                {topManagers.filter(m => m.gains2025 != null).reduce((s, m) => s + m.gains2025!, 0).toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                                {Math.round(topManagers.reduce((s, m) => s + m.inception, 0) / topManagers.length)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Soros Fund Management converted to family office in 2011</p>
        </div>
    );
}
