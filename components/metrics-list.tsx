'use client';

import { useState } from 'react';

interface Metric {
    id: string;
    title: string;
    question: string;
    observableVia: string[];
    stateEncoding: string[];
    whyItBelongs: string[];
    notes?: string;
}

interface MetricsListProps {
    metrics: Metric[];
}

export default function MetricsList({ metrics }: MetricsListProps) {
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    const toggleMetric = (id: string) => {
        setExpandedMetric(expandedMetric === id ? null : id);
    };

    return (
        <div className="space-y-4">
            {metrics.map((metric) => {
                const isExpanded = expandedMetric === metric.id;

                return (
                    <div
                        key={metric.id}
                        className="border border-border/50 rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300"
                    >
                        {/* Header - Always Visible */}
                        <button
                            onClick={() => toggleMetric(metric.id)}
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors duration-200"
                        >
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    {metric.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {metric.question}
                                </p>
                            </div>
                            <div className="ml-4">
                                <svg
                                    className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </button>

                        {/* Expandable Content */}
                        {isExpanded && (
                            <div className="px-6 pb-6 space-y-6 animate-fade-in">
                                {/* Observable Via */}
                                <div>
                                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                                        Observable via
                                    </h4>
                                    <ul className="space-y-2">
                                        {metric.observableVia.map((item, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-primary mr-2">•</span>
                                                <span className="text-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* State Encoding */}
                                <div>
                                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                                        State encoding
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {metric.stateEncoding.map((state, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium"
                                            >
                                                {state}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Why It Belongs */}
                                <div>
                                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                                        Why it belongs
                                    </h4>
                                    <ul className="space-y-2">
                                        {metric.whyItBelongs.map((reason, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span className="text-foreground">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Notes */}
                                {metric.notes && (
                                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500">
                                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                            <span className="font-semibold">Note:</span> {metric.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
