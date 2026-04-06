import ChartNavigation from '@/components/charts/chart-navigation';

export default function ChartLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="page-title text-4xl font-bold text-foreground mb-2">
                            Macro Charts
                        </h1>
                        <p className="text-muted-foreground">
                            Explore macroeconomic data across different asset classes and time periods
                        </p>
                    </div>
                    <a
                        href="/chart/data"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
                    >
                        View Data Table
                    </a>
                </div>
                <ChartNavigation />
                {children}
            </div>
        </div>
    );
}
