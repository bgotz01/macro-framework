'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navItems = [
        { href: '/cockpit', label: 'Cockpit' },
        { href: '/chart', label: 'Charts' },

        { href: '/regime-active', label: 'Regime' },

    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-elegant group-hover:shadow-xl transition-all duration-300">
                                <span className="text-primary-foreground font-bold text-xl">CP</span>
                            </div>
                            <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                                Capital Physics
                            </span>
                            <span className="text-xs text-muted-foreground font-medium tracking-wide">
                                Regime Detection
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 font-medium text-sm group"
                            >
                                <span className="relative z-10">{item.label}</span>
                                <div className="absolute inset-0 rounded-lg bg-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            </Link>
                        ))}
                        <div className="ml-4">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile menu button and theme toggle */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            className="p-3 rounded-xl hover:bg-muted/80 transition-colors duration-200 group"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 border-t border-border/40 animate-fade-in">
                        <div className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
