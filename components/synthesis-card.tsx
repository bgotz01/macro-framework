import Link from "next/link";

interface SynthesisCardProps {
    name: string;
    focus: string;
    description: string;
    href: string;
}

export function SynthesisCard({ name, focus, description, href }: SynthesisCardProps) {
    return (
        <Link href={href} className="block p-6 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-card-foreground mb-2">{name}</h3>
            <p className="text-sm font-medium text-primary mb-3">{focus}</p>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
        </Link>
    );
}
