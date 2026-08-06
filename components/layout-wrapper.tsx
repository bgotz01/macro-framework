'use client';

import { useState } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';
import CouncilChat from './chat/council-chat';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main content */}
                <main className="flex-1 min-w-0 transition-all duration-300">
                    <div className="px-4 pb-8 sm:px-6 lg:px-12 lg:py-8">
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Right sidebar council chat — rendered outside the flex row so it overlays cleanly */}
            <CouncilChat />
        </div>
    );
}
