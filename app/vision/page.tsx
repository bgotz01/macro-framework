'use client';

import Link from 'next/link';
import PageHeader from '@/components/page-header';

const visionPages = [
    { title: 'Architecture', href: '/vision/architecture' },
    { title: 'Paradigm', href: '/vision/paradigm' },
    { title: 'Overview', href: '/vision/overview' },
    { title: 'Outline', href: '/vision/outline' },
    { title: 'Plan', href: '/vision/plan' },
];

export default function VisionPage() {
    return (
        <div className="max-w-6xl mx-auto px-4">
            <PageHeader title="VISION" subtitle="Framework philosophy, architecture, and roadmap" />

            <div className="flex items-center gap-2 border-b border-border pb-2">
                {visionPages.map((page) => (
                    <Link
                        key={page.href}
                        href={page.href}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                    >
                        {page.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}
