import { Metadata } from 'next'
import ThesisSidebar from '@/components/thesis/thesis-sidebar'

export const metadata: Metadata = {
    title: 'Thesis - Macro Framework',
    description: 'A comprehensive guide to our macro investment framework and thinking process',
}

export default function ThesisLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <ThesisSidebar />
            <main className="flex-1 p-8 max-w-4xl mx-auto">
                {children}
            </main>
        </div>
    )
}