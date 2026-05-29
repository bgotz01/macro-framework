'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radar } from 'lucide-react';

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/cockpit', label: 'Cockpit' },
        { href: '/regime-active', label: 'Regime' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Logo — aligns with sidebar content */}
                <Link href="/" className="group flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-blue-500/10 transition group-hover:bg-white/[0.10]">
                        <Radar className="h-4 w-4 text-blue-200" />
                    </div>
                    <span className="text-sm font-medium tracking-[0.22em] text-white/75 transition group-hover:text-white">
                        CAPITAL PHYSICS
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => {
                        const active = pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${active
                                    ? 'text-white'
                                    : 'text-white/45 hover:text-white/80'
                                    }`}
                            >
                                {active && (
                                    <span className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.06]" />
                                )}
                                <span className="relative">{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className="ml-3 h-4 w-px bg-white/10" />
                    <button className="ml-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-sm text-white/70 backdrop-blur transition hover:bg-white/[0.10] hover:text-white">
                        Request access
                    </button>
                </div>

                {/* Mobile menu button */}
                <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.10] hover:text-white md:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}
