'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarItem {
    title: string;
    href: string;
    children?: SidebarItem[];
}

interface SidebarCategory {
    category: string;
    items: SidebarItem[];
}

const sidebarData: SidebarCategory[] = [
    {
        category: 'Overview',
        items: [
            { title: 'Cockpit', href: '/cockpit' },
        ],
    },
    {
        category: 'Regime State',
        items: [
            { title: 'Regime Active', href: '/regime-active' },
            { title: 'Regime Guide', href: '/regime-guide' },
            { title: 'Trend Pressure', href: '/trend-pressure' },
            { title: 'Regime Context', href: '/context' },
        ],
    },
    {
        category: 'Markets',
        items: [
            {
                title: 'Markets',
                href: '/markets',
                children: [
                    { title: 'Highlights', href: '/markets/highlights' },
                    { title: 'Asset Returns', href: '/markets/asset-returns' },
                    { title: 'US Annual Returns', href: '/markets/us-annual-returns' },
                    { title: 'Annual Filter', href: '/markets/annual-filter' },
                    { title: 'Crude Oil', href: '/markets/crude-oil' },
                ],
            },
            { title: 'Charts', href: '/chart' },
            { title: 'IPO Data', href: '/ipo-data' },
        ],
    },
    {
        category: 'Regime Historical',
        items: [
            { title: 'Regime Timeline', href: '/regime/historical' },
            { title: 'Regime Proximity', href: '/regime/proximity' },
            { title: 'Regime Returns', href: '/regime/returns' },
            {
                title: 'Regime Examples',
                href: '/regime/regime-examples',
                children: [
                    { title: 'Long Duration', href: '/regime/regime-examples/long-duration' },
                ],
            },
        ],
    },
    {
        category: 'Signals',
        items: [
            {
                title: 'Signals',
                href: '/signals',
                children: [
                    { title: 'System Stress', href: '/signals/system-stress' },
                    { title: 'Real Earnings Yield', href: '/signals/real-earnings-yield' },
                    { title: 'Equity Warning', href: '/signals/equity-warning' },
                    { title: 'Equity Sell', href: '/signals/equity-sell' },
                    { title: 'Equity Breakdown', href: '/signals/equity-breakdown' },
                    { title: 'Equity Danger', href: '/signals/equity-danger' },
                    { title: 'Growth Signal', href: '/signals/growth-regime' },
                    { title: 'Equity Value', href: '/signals/equity-value' },
                    { title: 'Normal', href: '/signals/normal' },
                ],
            },
            {
                title: 'Matrix',
                href: '/matrix',
                children: [
                    { title: 'Historical', href: '/matrix/historical' },
                    { title: 'Decades', href: '/matrix/decades' },
                    { title: 'Percentile', href: '/matrix/percentile' },
                    { title: 'Similar Periods', href: '/matrix/similar' },
                ],
            },
        ],
    },
    {
        category: 'Perspectives',
        items: [
            { title: 'OS Framework', href: '/os-framework' },
            { title: 'Wealth Distribution', href: '/perspectives/wealth-distribution' },
            { title: 'Hedge Funds', href: '/perspectives/hedge-funds' },
            {
                title: 'Framework',
                href: '/framework',
                children: [
                    { title: 'Process', href: '/framework/process' },
                    { title: 'O1 Signal', href: '/framework/o1-signal' },
                    { title: 'O2 Swing', href: '/framework/o2-swing' },
                    { title: 'O3 Story', href: '/framework/o3-story' },
                ],
            },
            {
                title: '12-Year Cycle',
                href: '/12-year-cycle',
                children: [
                    { title: 'Why 12?', href: '/12-year-cycle/why-twelve' },
                    { title: '1948 — Reconstruction', href: '/12-year-cycle/1948' },
                    { title: '1960 — Brand Capital', href: '/12-year-cycle/1960' },
                    { title: '1972 — Fiat Discovery', href: '/12-year-cycle/1972' },
                    { title: '1984 — Credit Expansion', href: '/12-year-cycle/1984' },
                    { title: '1996 — Digital Infrastructure', href: '/12-year-cycle/1996' },
                    { title: '2008 — Monetary Intervention', href: '/12-year-cycle/2008' },
                    { title: '2020 — Digital Economy', href: '/12-year-cycle/2020' },
                ],
            },
        ],
    },
    {
        category: 'Insights',
        items: [
            {
                title: 'Mechanics',
                href: '/insights/mechanics',
                children: [
                    { title: 'Debt Reduction', href: '/insights/mechanics/debt-reduction' },
                    { title: 'Inverted Yield Curve', href: '/insights/mechanics/inverted-yield-curve' },
                ],
            },
            {
                title: 'Major Money Events',
                href: '/insights/major-events/1971-gold-depeg',
                children: [
                    { title: '1971 Gold Depeg', href: '/insights/major-events/1971-gold-depeg' },
                    { title: '1970s Inflation Trap', href: '/insights/major-events/1970s-inflation' },
                ],
            },
            {
                title: 'Case Study',
                href: '/case-study/gold-flip',
                children: [
                    { title: 'Gold Flip', href: '/case-study/gold-flip' },
                    { title: 'Oil Flip', href: '/case-study/oil-flip' },
                    { title: 'Japan', href: '/case-study/japan' },
                    { title: 'Inflation', href: '/case-study/inflation' },
                ],
            },
            { title: 'Content Ideas', href: '/insights/content' },
        ],
    },
    {
        category: 'Tools',
        items: [
            { title: 'Data Input', href: '/data-input' },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (!hasInitialized) {
            const itemsToExpand: string[] = [];
            sidebarData.forEach(category => {
                category.items.forEach(item => {
                    if (pathname.startsWith(item.href)) {
                        itemsToExpand.push(item.href);
                        item.children?.forEach(child => {
                            if (pathname.startsWith(child.href)) itemsToExpand.push(child.href);
                        });
                    }
                });
            });
            setExpandedItems(itemsToExpand);
            setHasInitialized(true);
        }
    }, [pathname, hasInitialized]);

    const toggleExpanded = (href: string) => {
        if (isCollapsed) return;
        setExpandedItems(prev =>
            prev.includes(href) ? prev.filter(i => i !== href) : [...prev, href]
        );
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
    const isExpanded = (href: string) => !isCollapsed && expandedItems.includes(href);

    return (
        <>
            <style jsx>{`
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 2px; }
                .sidebar-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-16 left-0 z-50 h-[calc(100vh-4rem)]
                    border-r border-white/[0.06] bg-[#050507]/95 backdrop-blur-xl
                    transition-all duration-300 ease-out
                    lg:static lg:z-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'w-14 lg:w-14' : 'w-72 lg:w-72'}
                `}
            >
                <div className="flex h-full flex-col">
                    <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
                        <nav className={`space-y-5 ${isCollapsed ? 'hidden' : ''}`}>
                            {sidebarData.map((category) => (
                                <div key={category.category}>
                                    {/* Category label */}
                                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                        {category.category}
                                    </p>

                                    <div className="space-y-0.5">
                                        {category.items.map((item) => (
                                            <div key={item.href}>
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                                        className={`flex flex-1 items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 ${isActive(item.href)
                                                            ? 'bg-white/[0.08] text-white'
                                                            : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80'
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    {item.children && (
                                                        <button
                                                            onClick={() => toggleExpanded(item.href)}
                                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.04] hover:text-white/60"
                                                        >
                                                            <svg
                                                                className={`h-3 w-3 transition-transform duration-200 ${isExpanded(item.href) ? 'rotate-90' : ''}`}
                                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Children */}
                                                {item.children && isExpanded(item.href) && (
                                                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
                                                        {item.children.map((child) => (
                                                            <div key={child.href}>
                                                                <div className="flex items-center gap-1">
                                                                    <Link
                                                                        href={child.href}
                                                                        onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                                                        className={`flex flex-1 items-center rounded-lg px-3 py-1.5 text-sm transition-all duration-150 ${isActive(child.href)
                                                                            ? 'bg-white/[0.06] text-white/90'
                                                                            : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70'
                                                                            }`}
                                                                    >
                                                                        {child.title}
                                                                    </Link>
                                                                    {child.children && (
                                                                        <button
                                                                            onClick={() => toggleExpanded(child.href)}
                                                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white/20 transition hover:text-white/50"
                                                                        >
                                                                            <svg
                                                                                className={`h-3 w-3 transition-transform duration-200 ${isExpanded(child.href) ? 'rotate-90' : ''}`}
                                                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Grandchildren */}
                                                                {child.children && isExpanded(child.href) && (
                                                                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.04] pl-3">
                                                                        {child.children.map((grandchild) => (
                                                                            <Link
                                                                                key={grandchild.href}
                                                                                href={grandchild.href}
                                                                                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                                                                className={`flex items-center rounded-lg px-3 py-1.5 text-xs transition-all duration-150 ${isActive(grandchild.href)
                                                                                    ? 'bg-white/[0.06] text-white/80'
                                                                                    : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
                                                                                    }`}
                                                                            >
                                                                                {grandchild.title}
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Collapse toggle */}
                    <div className="hidden lg:block absolute -right-3 top-5">
                        <button
                            onClick={onToggleCollapse}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#050507] text-white/40 shadow-lg transition hover:text-white/70"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
