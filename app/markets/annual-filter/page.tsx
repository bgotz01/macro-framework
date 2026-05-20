import AnnualRegimeTable from '@/components/annual/annual-regime-table';
import PageHeader from '@/components/page-header';

export default function AnnualPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader title="Annual S&P 500 & Real Earnings Yield" subtitle="Year-end levels, annual returns, and Real Earnings Yield" />
            <AnnualRegimeTable />
        </div>
    );
}
