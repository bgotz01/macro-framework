// app/guide/page.tsx
import { OsGuide } from '@/components/OsGuide';

export default function GuidePage() {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mx-auto mb-10 max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Guide</h1>
                <p className="mt-3 text-lg text-muted-foreground">
                    A three-layer operating system for market intelligence: identify the regime, structure the playbook, and act
                    only when the market breaks.
                </p>

                <div className="mt-5 inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/80">Mantra:</span>
                    <span className="ml-2">
                        Regimes narrow the map. Playbooks define behavior. Outliers reveal opportunity.
                    </span>
                </div>
            </div>

            <OsGuide />
        </div>
    );
}