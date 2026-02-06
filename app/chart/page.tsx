import DBChart from '@/components/db-chart';

export default function ChartPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        SQLite Charts
                    </h1>
                    <p className="text-muted-foreground">
                        Select an asset class and time series to visualize data from the SQLite database
                    </p>
                </div>

                <DBChart height={500} />
            </div>
        </div>
    );
}
