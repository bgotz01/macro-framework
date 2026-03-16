export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          Economic Analysis Framework
        </div>
        <h1 className="text-5xl lg:text-6xl font-light tracking-wider mb-1 leading-tight" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
          CAPITAL PHYSICS
        </h1>
        <p className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-6" style={{ letterSpacing: '0.2em' }}>
          Mechanics • Regimes • Flows
        </p>
        <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
          A comprehensive framework for macro economic analysis, featuring the three laws of market behavior and historical event analysis.
        </p>


      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Macro Data Card */}
        <div className="group p-8 rounded-2xl border border-border/50 bg-card hover:shadow-elegant hover:border-border transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mr-4">
              <div className="w-6 h-6 border-2 border-primary-foreground rounded opacity-80"></div>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Macro Data</h3>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Economic data from major economies including bond yields, FX rates, and equity indexes.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              US, Japan, UK, Canada
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              Bond Yields by Country
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              FX & Equity Indexes
            </div>
          </div>
        </div>

        {/* Framework Card */}
        <div className="group p-8 rounded-2xl border border-border/50 bg-card hover:shadow-elegant hover:border-border transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mr-4">
              <div className="w-6 h-6 border-2 border-accent-foreground rounded-full opacity-80"></div>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Framework</h3>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The three fundamental laws governing market behavior and economic cycles.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              O1: Swing
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              O2: Signal
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
              O3: Story
            </div>
          </div>
        </div>

        {/* Major Events Card */}
        <div className="group p-8 rounded-2xl border border-border/50 bg-card hover:shadow-elegant hover:border-border transition-all duration-300 md:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center mr-4">
              <div className="w-6 h-6 border-2 border-secondary-foreground rounded-sm opacity-80"></div>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Major Events</h3>
          </div>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Critical monetary policy decisions that shaped modern markets.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary-foreground mr-3"></span>
              1971 Gold Depeg
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary-foreground mr-3"></span>
              1979 Volcker Rate Hikes
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary-foreground mr-3"></span>
              2008 QE Implementation
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative p-12 rounded-3xl gradient-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-primary-foreground/90 mb-8 text-lg max-w-2xl mx-auto">
            Dive into the macro framework and discover how economic patterns shape investment opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/framework"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Explore Framework
            </a>
            <a
              href="/macro-data"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200 font-semibold"
            >
              View Data
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl"></div>
      </div>
    </div>
  );
}