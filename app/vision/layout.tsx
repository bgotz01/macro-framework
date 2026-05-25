'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const visionPages = [
    { title: 'Vision', href: '/vision' },
    { title: 'Architecture', href: '/vision/architecture' },
    { title: 'Paradigm', href: '/vision/paradigm' },
    { title: 'Overview', href: '/vision/overview' },
    { title: 'Outline', href: '/vision/outline' },
];

export default function VisionLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-2 border-b border-border pb-2 mb-8 overflow-x-auto">
                {visionPages.map((page) => (
                    <Link
                        key={page.href}
                        href={page.href}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                            pathname === page.href
                                ? 'text-foreground bg-muted/80'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        )}
                    >
                        {page.title}
                    </Link>
                ))}
            </nav>
            {children}
        </div>
    );
}
