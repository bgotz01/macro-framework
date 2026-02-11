import Link from 'next/link'

export default function ThinkingPage() {
    const articles = [
        {
            title: 'Stacked Imbalance',
            slug: 'stacked-imbalance',
            description: 'Why this regime is radically different from prior generations',
            date: '2026'
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Thinking</h1>
            <div className="space-y-6">
                {articles.map((article) => (
                    <Link
                        key={article.slug}
                        href={`/thinking/${article.slug}`}
                        className="block p-6 border rounded-lg hover:border-blue-500 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold mb-2">{article.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{article.description}</p>
                        <span className="text-sm text-gray-500">{article.date}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
