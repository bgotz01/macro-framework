import MADBChart from '@/components/charts/ma-db-chart';

export default function MatrixChartPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Moving Average Charts
                    </h1>
                    <p className="text-muted-foreground">
                        Select an asset class and time series to visualize data with 12-month moving averages
                    </p>
                </div>

                <MADBChart height={500} />
            </div>
        </div>
    );
}
