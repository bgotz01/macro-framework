import Link from 'next/link';
import DataPipeline from '@/components/data-pipeline';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          Economic Analysis Framework
        </div>
        <h1 className="page-title text-5xl lg:text-6xl mb-1 leading-tight">
          CAPITAL PHYSICS
        </h1>
        <p className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-6" style={{ letterSpacing: '0.2em' }}>
          Regime Detection • Capital Allocation
        </p>

      </div>


      {/* Regime Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Link href="/regime-guide" className="group relative overflow-hidden p-8 rounded-2xl border border-border/50 bg-card hover:border-violet-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="text-xs font-medium text-violet-500 uppercase tracking-widest mb-3">Learn</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Regime Guide</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              How each regime is defined, what drives transitions, and how to interpret the signals.
            </p>
            <div className="text-xs text-violet-500 font-medium group-hover:translate-x-1 transition-transform duration-200">Explore →</div>
          </div>
        </Link>

        <Link href="/regime-active" className="group relative overflow-hidden p-8 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-3">Monthly</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Active Regime</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Current regime state, signal readings, and capital allocation recommendations. Updated monthly.
            </p>
            <div className="text-xs text-emerald-500 font-medium group-hover:translate-x-1 transition-transform duration-200">View signals →</div>
          </div>
        </Link>

        <Link href="/cockpit" className="group relative overflow-hidden p-8 rounded-2xl border border-border/50 bg-card hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="text-xs font-medium text-amber-500 uppercase tracking-widest mb-3">Live · Daily</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Cockpit</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Full macro dashboard — liquidity, valuation, price regime and trend pressure in one view.
            </p>
            <div className="text-xs text-amber-500 font-medium group-hover:translate-x-1 transition-transform duration-200">Open cockpit →</div>
          </div>
        </Link>
      </div>

      {/* Data Pipeline */}
      <div className="mb-16">
        <DataPipeline />
      </div>

    </div>
  );
}