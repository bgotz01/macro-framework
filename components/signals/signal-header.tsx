interface SignalHeaderProps {
    title: string;
    titleColor: string;
    subtitle: string;
    priority: number;
    category: {
        name: string;
        color: string;
        description: string;
    };
    trigger: string | string[];
}

export default function SignalHeader({
    title,
    titleColor,
    subtitle,
    priority,
    category,
    trigger,
}: SignalHeaderProps) {
    const categoryBgColor = category.color.includes('red')
        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        : category.color.includes('orange')
            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
            : category.color.includes('purple')
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Category banner */}
            <div className={`px-6 py-3 border-b ${categoryBgColor}`}>
                <div className="font-semibold">{category.name}</div>
            </div>

            {/* Content */}
            <div className="p-6 bg-muted/30">
                <div className="grid md:grid-cols-[1fr,auto] gap-6">
                    {/* Left column - Signal details */}
                    <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">Signal:</span>
                            <h1 className={`text-2xl font-bold ${titleColor}`}>{title}</h1>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">Description:</span>
                            <p className="text-sm">{subtitle}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">Action:</span>
                            <p className="text-sm">{category.description}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">Priority:</span>
                            <p className="text-sm font-medium">{priority} of 8</p>
                        </div>
                    </div>

                    {/* Right column - Trigger */}
                    <div className="md:min-w-[280px]">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trigger Condition</div>
                        <div className="bg-background border border-border p-4 rounded font-mono text-sm space-y-1">
                            {Array.isArray(trigger) ? (
                                trigger.map((line, i) => <div key={i}>{line || '\u00A0'}</div>)
                            ) : (
                                <div>{trigger}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
