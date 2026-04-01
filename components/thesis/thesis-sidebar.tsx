'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const thesisNavigation = [
    {
        title: 'Introduction',
        href: '/thesis',
        sections: []
    },
    {
        title: 'Chapter 1: Foundation',
        href: '/thesis/foundation',
        sections: [
            { title: 'Market Cycles', href: '/thesis/foundation/market-cycles' },
            { title: 'Guide', href: '/guide' },
            { title: 'Cycle Library', href: '/cycles' }
        ]
    }
]

export default function ThesisSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-8">
                <Link href="/thesis" className="block">
                    <h2 className="text-xl font-bold text-gray-900">Macro Framework</h2>
                    <p className="text-sm text-gray-600">Investment Thesis</p>
                </Link>
            </div>

            <nav className="space-y-2">
                {thesisNavigation.map((item) => {
                    const isActive = pathname === item.href
                    const hasActiveSection = item.sections.some(section => pathname === section.href)
                    const isExpanded = isActive || hasActiveSection

                    return (
                        <div key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                {item.title}
                            </Link>

                            {item.sections.length > 0 && isExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {item.sections.map((section) => (
                                        <Link
                                            key={section.href}
                                            href={section.href}
                                            className={cn(
                                                'block px-3 py-1 rounded-md text-xs transition-colors',
                                                pathname === section.href
                                                    ? 'bg-blue-50 text-blue-800'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                            )}
                                        >
                                            {section.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-2">
                    <p>Quick Links:</p>
                    <div className="space-y-1">
                        <Link href="/matrix" className="block text-blue-600 hover:text-blue-800">
                            Matrix Analysis
                        </Link>
                        <Link href="/chart" className="block text-blue-600 hover:text-blue-800">
                            Charts & Data
                        </Link>
                        <Link href="/cycles" className="block text-blue-600 hover:text-blue-800">
                            Market Cycles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
