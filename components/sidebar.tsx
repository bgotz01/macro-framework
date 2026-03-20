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

interface SidebarCategory {
    category: string;
    items: SidebarItem[];
}

const sidebarData: SidebarCategory[] = [
    {
        category: 'Overview',
        items: [
            {
                title: 'Guide',
                href: '/guide',
            },
            {
                title: 'Wealth Distribution',
                href: '/wealth-distribution',
            },
        ],
    },
    {
        category: 'Markets',
        items: [
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
            {
                title: 'Regime Detector',
                href: '/regime',
            },
            {
                title: 'Regime Active',
                href: '/regime-active',
            },
            {
                title: 'Trend Pressure',
                href: '/trend-pressure',
            },
            {
                title: 'Regime Context',
                href: '/context',
            },
            {
                title: 'Signals',
                href: '/signals',
            },
            {
                title: 'S&P 500',
                href: '/sp500',
                children: [
                    { title: 'Stocks', href: '/sp500/stocks' },

                ],
            },
            {
                title: 'Chart',
                href: '/chart',
                children: [
                    { title: 'All Charts', href: '/chart' },
                    { title: 'Percentile Analysis', href: '/chart/percentile' },
                    { title: 'Data Explorer', href: '/chart/data' },
                ],
            },
            {
                title: 'Markets',
                href: '/markets',
                children: [
                    { title: 'Highlights', href: '/markets/highlights' },
                    { title: 'Annual Returns', href: '/markets/annual-returns' },

                    { title: 'Stocks', href: '/markets/stocks' },
                    { title: 'Crude Oil', href: '/markets/crude-oil' },
                ],
            },
        ],
    },
    {
        category: 'Perspectives',
        items: [
            {
                title: 'Framework',
                href: '/framework',
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
                ]
            },
            {
                title: 'Cycles',
                href: '/cycles',
                children: [
                    { title: '80-Year Cycle', href: '/cycles/80-year' },
                    { title: 'Debt Cycle', href: '/cycles/debt-cycle' },
                    { title: 'Credit Cycle', href: '/cycles/credit-cycle' },
                    { title: 'Business Cycle', href: '/cycles/business-cycle' },
                ],
            },
            {
                title: 'Paradigm',
                href: '/paradigm',
            },
        ],
    },
    {
        category: 'Insights',
        items: [
            {
                title: 'Mechanics',
                href: '/insights/mechanics',
            },
            {
                title: 'Major Money Events',
                href: '/insights/major-events',
                children: [
                    { title: '1971 Gold Depeg', href: '/insights/major-events/1971-gold-depeg' },
                    { title: '1970s Inflation Trap', href: '/insights/major-events/1970s-inflation' },
                    { title: '2000 Low Rates', href: '/insights/major-events/2000-low-rates' },
                    { title: '2006 Yield Curve', href: '/insights/major-events/2006-yield-curve' },
                    { title: '2008 QE', href: '/insights/major-events/2008-qe' },
                    { title: '2001 China joins WTO', href: '/insights/other-events/2001-china-wto' },
                ],
            },

        ],
    },
    {
        category: 'Tools',
        items: [
            {
                title: 'Data Input',
                href: '/data-input',
            },
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

    // Auto-expand sections based on current path on initial load
    useEffect(() => {
        if (!hasInitialized) {
            const itemsToExpand: string[] = [];
            sidebarData.forEach(category => {
                category.items.forEach(item => {
                    if (pathname.startsWith(item.href)) {
                        itemsToExpand.push(item.href);
                        if (item.children) {
                            item.children.forEach(child => {
                                if (pathname.startsWith(child.href)) {
                                    itemsToExpand.push(child.href);
                                }
                            });
                        }
                    }
                });
            });
            setExpandedItems(itemsToExpand);
            setHasInitialized(true);
        }
    }, [pathname, hasInitialized]);

    const toggleExpanded = (href: string) => {
        if (isCollapsed) return; // Don't expand when collapsed
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        );
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
    const isExpanded = (href: string) => !isCollapsed && expandedItems.includes(href);

    return (
        <>
            <style jsx>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 3px;
                }
                .sidebar-scroll:hover::-webkit-scrollbar-thumb {
                    background: hsl(var(--muted-foreground));
                }
                .sidebar-scroll:hover::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--foreground));
                }
            `}</style>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-20 left-0 z-50 h-[calc(100vh-5rem)] bg-card/95 backdrop-blur-xl transition-all duration-300 ease-out lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-16 lg:w-16' : 'w-80 lg:w-80'}
        `}
            >
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto p-6 sidebar-scroll">
                        {!isCollapsed && (
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                                Navigation
                            </h2>
                        )}

                        <nav className={`space-y-6 ${isCollapsed ? 'hidden' : ''}`}>
                            {sidebarData.map((category) => (
                                <div key={category.category} className="space-y-2">
                                    {/* Category Header */}
                                    <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-4 mb-3 border-b border-muted-foreground/10 pb-2">
                                        {category.category}
                                    </h3>

                                    {/* Category Items */}
                                    {category.items.map((item) => (
                                        <div key={item.href} className="animate-slide-in">
                                            <div className="flex items-center">
                                                <Link
                                                    href={item.href}
                                                    className={`
                        flex-1 flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group
                        ${isActive(item.href)
                                                            ? 'bg-muted/60 text-foreground'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                                                    onClick={() => {
                                                        // Only close sidebar on mobile
                                                        if (window.innerWidth < 1024) {
                                                            onClose();
                                                        }
                                                    }}
                                                    title={isCollapsed ? item.title : undefined}
                                                >
                                                    {isCollapsed ? (
                                                        // Hide content when collapsed - only show hamburger menu
                                                        null
                                                    ) : (
                                                        <span className="flex-1">{item.title}</span>
                                                    )}
                                                </Link>
                                                {item.children && !isCollapsed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleExpanded(item.href);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-muted/80 transition-colors duration-200 group"
                                                        aria-label={`Toggle ${item.title} submenu`}
                                                    >
                                                        <svg
                                                            className={`h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all duration-200 ${isExpanded(item.href) ? 'rotate-90' : ''
                                                                }`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Submenu */}
                                            {item.children && isExpanded(item.href) && !isCollapsed && (
                                                <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                                                    {item.children.map((child) => (
                                                        <div key={child.href}>
                                                            <div className="flex items-center">
                                                                <Link
                                                                    href={child.href}
                                                                    className={`
                                flex-1 flex items-center rounded-lg px-4 py-2.5 text-sm transition-all duration-200 group
                                ${isActive(child.href)
                                                                            ? 'bg-muted/50 text-foreground'
                                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                                                        }
                              `}
                                                                    onClick={() => {
                                                                        // Only close sidebar on mobile
                                                                        if (window.innerWidth < 1024) {
                                                                            onClose();
                                                                        }
                                                                    }}
                                                                >
                                                                    <span>{child.title}</span>
                                                                </Link>
                                                                {child.children && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            toggleExpanded(child.href);
                                                                        }}
                                                                        className="p-2 rounded-lg hover:bg-muted/80 transition-colors duration-200 group"
                                                                        aria-label={`Toggle ${child.title} submenu`}
                                                                    >
                                                                        <svg
                                                                            className={`h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all duration-200 ${isExpanded(child.href) ? 'rotate-90' : ''
                                                                                }`}
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M9 5l7 7-7 7"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Third level submenu */}
                                                            {child.children && isExpanded(child.href) && (
                                                                <div className="ml-6 mt-1 space-y-1 animate-fade-in">
                                                                    {child.children.map((grandchild) => (
                                                                        <Link
                                                                            key={grandchild.href}
                                                                            href={grandchild.href}
                                                                            className={`
                                    flex items-center rounded-lg px-4 py-2 text-sm transition-all duration-200 group
                                    ${isActive(grandchild.href)
                                                                                    ? 'bg-muted/50 text-foreground'
                                                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                                                                }
                                  `}
                                                                            onClick={() => {
                                                                                // Only close sidebar on mobile
                                                                                if (window.innerWidth < 1024) {
                                                                                    onClose();
                                                                                }
                                                                            }}
                                                                        >
                                                                            <span>{grandchild.title}</span>
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
                            ))}
                        </nav>
                    </div>



                    {/* Collapse toggle for desktop */}
                    <div className="hidden lg:block absolute -right-3 top-6">
                        <button
                            onClick={onToggleCollapse}
                            className="p-2 rounded-full bg-card hover:bg-muted/80 transition-all duration-200 group shadow-lg border border-border"
                            aria-label="Toggle sidebar"
                        >
                            {/* Hamburger menu icon */}
                            <svg
                                className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
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