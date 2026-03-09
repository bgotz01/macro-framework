interface CycleCardProps {
    cycleNumber: number;
    title: string;
    subtitle?: string;
    period: string;
    accent: string;
    borderAccent: string;
    isExpanded: boolean;
    onToggle: () => void;
    isCurrent?: boolean;
    children: React.ReactNode;
}

export default function CycleCard({
    cycleNumber,
    title,
    subtitle,
    period,
    accent,
    borderAccent,
    isExpanded,
    onToggle,
    isCurrent,
    children,
}: CycleCardProps) {
    return (
        <div
            className={`group overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm transition-all ${borderAccent} border-l-4 ${isCurrent ? 'ring-1 ring-primary/30' : ''
                }`}
        >
            <button
                onClick={onToggle}
                className={`w-full text-left transition-colors hover:bg-muted/30 ${isExpanded ? `bg-gradient-to-r ${accent}` : ''
                    }`}
            >
                <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-sm font-bold text-foreground shadow-sm">
                            {cycleNumber}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                    {title}
                                </h2>
                                {isCurrent && (
                                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                        Current
                                    </span>
                                )}
                            </div>

                            {subtitle && (
                                <p className="text-sm text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}

                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                {period}
                            </p>
                        </div>
                    </div>

                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground">
                        <span className={`${isExpanded ? 'rotate-45' : ''} transition-transform`}>
                            +
                        </span>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-border/60 bg-background/40 px-5 py-5">
                    <div className="space-y-4">{children}</div>
                </div>
            )}
        </div>
    );
}

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </div>
            <div className="text-sm leading-6 text-foreground/90">{children}</div>
        </div>
    );
}

interface PhaseProps {
    title: string;
    subtitle: string;
    period: string;
    isCurrent?: boolean;
    children: React.ReactNode;
}

export function Phase({ title, subtitle, period, isCurrent, children }: PhaseProps) {
    return (
        <div
            className={`rounded-2xl border p-4 ${isCurrent
                ? 'border-primary/30 bg-primary/5 shadow-sm'
                : 'border-border/70 bg-card shadow-sm'
                }`}
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {title}
                        </span>
                        {isCurrent && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                                Live
                            </span>
                        )}
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                        {subtitle}
                    </h3>
                </div>

                <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {period}
                </span>
            </div>

            <div className="space-y-3">{children}</div>
        </div>
    );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-20 shrink-0 pt-[3px] text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </div>
            <div className="flex-1 text-sm leading-6 text-foreground/90">{children}</div>
        </div>
    );
}

export function MiniNote({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs italic leading-5 text-muted-foreground">
            {children}
        </div>
    );
}

export function Break({
    kind,
    children,
}: {
    kind: 'phase' | 'regime';
    children: React.ReactNode;
}) {
    const isRegime = kind === 'regime';

    return (
        <div
            className={`rounded-xl border px-4 py-3 text-sm leading-6 ${isRegime
                ? 'border-primary/30 bg-primary/10 font-medium text-foreground'
                : 'border-border/60 bg-muted/30 text-muted-foreground'
                }`}
        >
            <div className="flex items-start gap-3">
                <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isRegime ? 'bg-primary' : 'bg-muted-foreground/50'
                        }`}
                />
                <div>{children}</div>
            </div>
        </div>
    );
}

export function RegimeEvent({
    year,
    title,
    description,
    breakdown,
}: {
    year: string;
    title: string;
    description: string;
    breakdown: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/[0.06] shadow-sm">
            <div className="border-b border-red-500/20 px-4 py-3">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-700 dark:text-red-400">
                        {title}
                    </span>
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 dark:text-red-400">
                        {year}
                    </span>
                </div>
                <div className="text-sm font-semibold leading-6 text-red-800 dark:text-red-300">
                    {description}
                </div>
            </div>

            <div className="px-4 py-3">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-red-700 dark:text-red-400">
                    Transmission Breakdown
                </div>
                <div className="text-sm leading-6 text-red-800 dark:text-red-300">
                    {breakdown}
                </div>
            </div>
        </div>
    );
}
