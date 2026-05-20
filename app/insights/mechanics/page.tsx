import Link from 'next/link';
import PageHeader from '@/components/page-header';

export default function GuidePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <PageHeader title="MECHANICS" subtitle="Key macro concepts and market signals" />

            <div className="grid gap-6">
                <Link
                    href="/insights/mechanics/debt-reduction"
                    className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
                >
                    <h2 className="text-2xl font-bold mb-2">The Two Release Valves</h2>
                    <p className="text-muted-foreground">
                        Understanding the two pathways for debt reduction: default/restructuring vs inflation/monetization
                    </p>
                </Link>

                <Link
                    href="/insights/mechanics/inverted-yield-curve"
                    className="block bg-card border rounded-lg p-6 hover:border-primary transition-colors"
                >
                    <h2 className="text-2xl font-bold mb-2">The Inverted Yield Curve</h2>
                    <p className="text-muted-foreground">
                        One of the most important macro warning signals—what it means and why it matters
                    </p>
                </Link>
            </div>
        </div>
    );
}
