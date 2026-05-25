'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';

type Pillar = {
    title: string;
    subtitle: string;
    content: string;
};

export default function PlanPage() {
    const [quadrants, setQuadrants] = useState<Record<string, Pillar>>({
        pillar1: {
            title: '1️⃣ Build the Canon',
            subtitle: '(Your Intellectual Core)',
            content: `You are not "writing articles."
You are building: The Regime Detection Canon.

Objective:
Publish 1 definitive macro framework document.
Not 20 mediocre posts. One serious, structured, citation-ready document.

Deliverable:
• 40–70 page formal PDF
• Clear signal definitions
• Historical validation
• Policy shock framework
• Transmission engine logic
• Case studies (1979, 2000, 2008, 2020)

Upload to:
• SSRN
• Your website
• Public repository

This becomes:
• Your anchor for professors
• Your anchor for conferences
• Your anchor for immigration
Everything points back to this.`
        },

        pillar2: {
            title: '2️⃣ Operational Proof',
            subtitle: '(Real-World Usage)',
            content: `Immigration aside — this matters for your business.

Objective:
Have real capital influenced by your signals.
Not hypotheticals. Not theory.

Even:
• 1 wealth advisor using it
• 1 family office test allocation
• A paid research subscriber

Document:
• Decisions made using your signals
• Outcomes
• Risk avoided
• Stress periods navigated

You don't need AUM bragging. You need documented impact.
This is far more powerful than blog posts.`
        },

        pillar3: {
            title: '3️⃣ Authority Signals',
            subtitle: '(Lightweight Version)',
            content: `You don't need a full academic career.

You need:
• 2–3 professors who have read your work
• 1–2 conference talks (even regional CFA chapters)
• 1–3 podcast appearances
• A few citations or downloads

That's it.
Authority is about third-party acknowledgment, not mass fame.`
        },

        pillar4: {
            title: '4️⃣ Public Identity Shift',
            subtitle: '',
            content: `This is subtle but critical.

You must consistently present yourself as:
Macro Regime Architect
Designer of Signal-Based Capital Allocation Systems

Not:
• "AI founder"
• "Trader"
• "Investor"
• "Astrology + macro polymath"

Immigration cases look for coherence.
Your identity must look inevitable.`
        },
    });

    const [editing, setEditing] = useState<string | null>(null);

    const handleEdit = (quadrant: string, field: 'title' | 'subtitle' | 'content', value: string) => {
        setQuadrants(prev => ({
            ...prev,
            [quadrant]: {
                ...prev[quadrant],
                [field]: value
            }
        }));
    };

    const renderQuadrant = (key: string, pillar: Pillar) => (
        <div className="p-6 bg-card rounded-lg border-2 border-border/50 min-h-[400px] hover:border-border transition-colors">
            <div className="mb-4">
                <input
                    type="text"
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-card-foreground mb-1"
                    value={pillar.title}
                    onChange={(e) => handleEdit(key, 'title', e.target.value)}
                />
                {pillar.subtitle && (
                    <input
                        type="text"
                        className="w-full text-lg text-muted-foreground bg-transparent border-none outline-none"
                        value={pillar.subtitle}
                        onChange={(e) => handleEdit(key, 'subtitle', e.target.value)}
                    />
                )}
            </div>
            <div
                className="cursor-pointer hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                onClick={() => setEditing(key)}
            >
                {editing === key ? (
                    <textarea
                        className="w-full h-full min-h-[250px] bg-transparent border-none outline-none resize-none text-card-foreground"
                        value={pillar.content}
                        onChange={(e) => handleEdit(key, 'content', e.target.value)}
                        onBlur={() => setEditing(null)}
                        autoFocus
                    />
                ) : (
                    <div className="whitespace-pre-wrap text-muted-foreground">
                        {pillar.content}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader title="PLAN" subtitle="The 4-Pillar Strategy" />

            {/* 2x2 Grid of 4 Pillars */}
            <div className="grid grid-cols-2 gap-6 mb-12">
                {renderQuadrant('pillar1', quadrants.pillar1)}
                {renderQuadrant('pillar2', quadrants.pillar2)}
                {renderQuadrant('pillar3', quadrants.pillar3)}
                {renderQuadrant('pillar4', quadrants.pillar4)}
            </div>

            {/* Timeline */}
            <section className="p-6 bg-card rounded-lg border-2 border-border/50">
                <h2 className="text-3xl font-bold mb-6 text-center text-card-foreground">
                    🔥 The Compressed Strategy (12–18 Months)
                </h2>

                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">Instead of:</h3>
                    <ul className="list-disc pl-6 space-y-1 line-through opacity-60 text-muted-foreground">
                        <li>20 articles</li>
                        <li>8 conferences</li>
                        <li>15 collaborations</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4 text-card-foreground">You focus on:</h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded border border-border/30">
                            <h4 className="font-bold text-lg mb-2 text-card-foreground">Month 1–3</h4>
                            <p className="text-muted-foreground">Write the Canon.</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded border border-border/30">
                            <h4 className="font-bold text-lg mb-2 text-card-foreground">Month 4–6</h4>
                            <p className="text-muted-foreground">Launch it publicly. Start advisory relationships.</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded border border-border/30">
                            <h4 className="font-bold text-lg mb-2 text-card-foreground">Month 6–12</h4>
                            <p className="text-muted-foreground">Give talks. Appear on podcasts. Reach out to professors.</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded border border-border/30">
                            <h4 className="font-bold text-lg mb-2 text-card-foreground">Month 12+</h4>
                            <p className="text-muted-foreground">Collect letters. Apply.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
