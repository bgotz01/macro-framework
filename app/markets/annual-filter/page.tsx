import AnnualRegimeTable from '@/components/annual/annual-regime-table';

export default function AnnualPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">Annual S&P 500 & Real Earnings Yield</h1>
                <p className="page-subtitle">
                    Year-end levels, annual returns, and Real Earnings Yield
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>
            <AnnualRegimeTable />
        </div>
    );
}
