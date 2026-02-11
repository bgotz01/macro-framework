import StockValuationChart from '@/components/charts/stock-valuation-chart';
import StockDataTable from '@/components/stock-data-table';

export default function StocksPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Stock Valuations
                </h1>
                <p className="text-lg text-muted-foreground">
                    Track valuation metrics for the most valuable technology companies
                </p>
            </div>

            <div className="space-y-8">
                <StockValuationChart height={600} />

                <StockDataTable />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <h3 className="text-lg font-semibold mb-3">About the Data</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            This page tracks quarterly valuation metrics for major technology companies including:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Apple (AAPL)</li>
                            <li>Microsoft (MSFT)</li>
                            <li>Alphabet/Google (GOOGL)</li>
                            <li>Amazon (AMZN)</li>
                            <li>NVIDIA (NVDA)</li>
                            <li>Meta/Facebook (META)</li>
                            <li>Tesla (TSLA)</li>
                            <li>Broadcom (AVGO)</li>
                            <li>Netflix (NFLX)</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <h3 className="text-lg font-semibold mb-3">Available Metrics</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>
                                <span className="font-medium text-card-foreground">P/E Ratio:</span> Price-to-Earnings ratio, a key valuation metric
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">P/S Ratio:</span> Price-to-Sales ratio, calculated as Price / (TTM Revenue / Shares)
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">Stock Price:</span> Quarterly closing price
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">EPS:</span> Earnings Per Share for the quarter
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">TTM EPS:</span> Trailing Twelve Months Earnings Per Share
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">Revenue:</span> Quarterly revenue in millions
                            </li>
                            <li>
                                <span className="font-medium text-card-foreground">Shares:</span> Outstanding shares in millions
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
