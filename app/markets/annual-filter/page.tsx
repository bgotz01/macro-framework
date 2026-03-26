import AnnualRegimeTable from '@/components/annual/annual-regime-table';

export default function AnnualPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-2">Annual S&P 500 & Real Earnings Yield</h1>
            <p className="text-muted-foreground mb-8">
                Year-end S&P 500 levels, annual returns, and Real Earnings Yield at each year-end.
            </p>
            <AnnualRegimeTable />
        </div>
    );
}
