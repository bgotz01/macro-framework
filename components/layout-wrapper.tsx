'use client';

import { useState } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content */}
                <main className="flex-1 min-w-0 transition-all duration-300">
                    {/* Mobile sidebar toggle */}
                    <div className="lg:hidden p-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center space-x-2 p-3 rounded-xl hover:bg-muted/80 transition-colors duration-200 group"
                            aria-label="Open sidebar"
                        >
                            <svg
                                className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                                Menu
                            </span>
                        </button>
                    </div>

                    <div className="px-6 pb-8 lg:px-12 lg:py-8">
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}