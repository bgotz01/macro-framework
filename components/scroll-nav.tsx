'use client';

import { useState, useEffect } from 'react';

interface ScrollNavItem {
    id: string;
    label: string;
}

interface ScrollNavProps {
    items: ScrollNavItem[];
    className?: string;
}

export default function ScrollNav({ items, className = '' }: ScrollNavProps) {
    const [activeSection, setActiveSection] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            const sections = items.map(item => document.getElementById(item.id)).filter(Boolean);
            const scrollPosition = window.scrollY + 100; // Offset for better UX

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(items[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Set initial active section

        return () => window.removeEventListener('scroll', handleScroll);
    }, [items]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
            <div className={`bg-card/95 backdrop-blur-sm border border-border/50 rounded-l-2xl shadow-lg transition-all duration-300 ${isExpanded ? 'w-56' : 'w-12'
                }`}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-card-foreground transition-colors"
                    aria-label="Toggle navigation"
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Navigation Content */}
                {isExpanded && (
                    <div className="px-4 pb-4">
                        <h3 className="text-sm font-semibold text-card-foreground mb-3">Navigate</h3>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                                        ${activeSection === item.id
                                            ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                                            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                                        }
                                    `}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}