import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// Load knowledge base once at module level (reset on each cold start)
let knowledgeBase: string | null = null;
function getKnowledgeBase(): string {
    if (!knowledgeBase) {
        const filePath = path.join(process.cwd(), 'docs/reference/REGIME_REFERENCE.md');
        knowledgeBase = fs.readFileSync(filePath, 'utf-8');
    }
    return knowledgeBase;
}

async function getLiveContext(): Promise<string> {
    try {
        // Latest regime from timeline
        const [regimeRows, dataRows] = await Promise.all([
            prisma.$queryRaw<{ date: string; regime: string; entry_date: string }[]>`
                SELECT date, regime, entry_date FROM macro_regime_timeline ORDER BY date DESC LIMIT 1
            `,
            prisma.$queryRaw<{ series_name: string; date: string; value: number; percentile_rank: number | null }[]>`
                SELECT DISTINCT ON (series_name) series_name, date, value, percentile_rank
                FROM macro_percentile_analysis
                WHERE series_name IN ('CPI','Real-10Y','Real-3M','Real-Earnings-Yield-5yr','Earnings-Yield-Premium-5yr','PE-5yr','M2-YoY')
                ORDER BY series_name, date DESC
            `,
        ]);

        const regime = regimeRows[0];
        const metrics = Object.fromEntries(dataRows.map(r => [r.series_name, r]));

        const fmt = (v: number | null | undefined, decimals = 2) =>
            v != null ? `${v.toFixed(decimals)}%` : 'N/A';
        const pct = (v: number | null | undefined) =>
            v != null ? `${v.toFixed(0)}th percentile` : 'N/A';

        return `
## Live Data (as of ${regime?.date ?? 'unknown'})

**Active Regime:** ${regime?.regime ?? 'Unknown'} (since ${regime?.entry_date ?? 'unknown'})

**Key Metrics:**
- CPI (YoY): ${fmt(metrics['CPI']?.value)} — ${pct(metrics['CPI']?.percentile_rank)}
- Real 10Y Yield: ${fmt(metrics['Real-10Y']?.value)}
- Real 3M Yield: ${fmt(metrics['Real-3M']?.value)}
- Real Earnings Yield (5yr): ${fmt(metrics['Real-Earnings-Yield-5yr']?.value)}
- Earnings Yield Premium (5yr): ${fmt(metrics['Earnings-Yield-Premium-5yr']?.value)}
- PE-5yr: ${metrics['PE-5yr']?.value?.toFixed(1) ?? 'N/A'}x — ${pct(metrics['PE-5yr']?.percentile_rank)}
- M2 YoY: ${fmt(metrics['M2-YoY']?.value)}
`;
    } catch {
        return '\n## Live Data\nUnavailable\n';
    }
}

const SYSTEM_PROMPT = `You are an expert macro-economic analyst assistant for the "Power Law" framework application. You help users understand market regimes, signals, cycles, data series, and the overall macro framework.

Answer questions clearly and concisely. Reference specific metrics, thresholds, and regime definitions when relevant. When asked about current data or the latest regime, use the Live Data section below.

Use the following knowledge base as your primary reference:

---
`;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return Response.json({ error: 'Chat feature not configured' }, { status: 503 });
        }
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return Response.json({ error: 'Messages array required' }, { status: 400 });
        }

        const knowledge = getKnowledgeBase();
        const liveContext = await getLiveContext();

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT + knowledge + '\n\n---\n' + liveContext },
                ...messages,
            ],
            temperature: 0.4,
            max_tokens: 1500,
        });

        // Return a streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error: any) {
        console.error('Chat API error:', error);
        return Response.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}
