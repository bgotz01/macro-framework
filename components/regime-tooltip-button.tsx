import { useState } from 'react';

interface TooltipSection {
    emoji: string;
    label: string;
    threshold: string;
    points: string[];
    note?: string;
}

interface RegimeTooltipButtonProps {
    icon: string;
    label: string;
    title: string;
    sections: TooltipSection[];
    colorClass: string;
}

export default function RegimeTooltipButton({ icon, label, title, sections, colorClass }: RegimeTooltipButtonProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`text-xs px-2 py-1 rounded-full ${colorClass} transition-colors cursor-help`}
            >
                {icon} {label}
            </button>
            {showTooltip && (
                <div className="absolute z-50 right-0 top-full mt-2 w-96 p-4 bg-card border border-border rounded-lg shadow-xl">
                    <div className="text-sm font-bold mb-2">{title}</div>
                    <div className="space-y-3 text-xs">
                        {sections.map((section, index) => (
                            <div key={index} className={`border-l-4 ${section.emoji === '🟢' ? 'border-green-500' :
                                    section.emoji === '🔵' ? 'border-blue-500' :
                                        section.emoji === '🟠' ? 'border-orange-500' :
                                            'border-red-500'
                                } pl-3`}>
                                <div className={`font-bold mb-1 ${section.emoji === '🟢' ? 'text-green-700 dark:text-green-400' :
                                        section.emoji === '🔵' ? 'text-blue-700 dark:text-blue-400' :
                                            section.emoji === '🟠' ? 'text-orange-700 dark:text-orange-400' :
                                                'text-red-700 dark:text-red-400'
                                    }`}>
                                    {section.emoji} {section.label}
                                </div>
                                <div className="text-muted-foreground space-y-0.5">
                                    <div>• {section.threshold}</div>
                                    {section.points.map((point, i) => (
                                        <div key={i}>• {point}</div>
                                    ))}
                                    {section.note && (
                                        <div className="italic mt-1 text-xs">{section.note}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
