import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Load knowledge base once at module level
let knowledgeBase: string | null = null;
function getKnowledgeBase(): string {
    if (!knowledgeBase) {
        const filePath = path.join(process.cwd(), 'FRAMEWORK_KNOWLEDGE.md');
        knowledgeBase = fs.readFileSync(filePath, 'utf-8');
    }
    return knowledgeBase;
}

const SYSTEM_PROMPT = `You are an expert macro-economic analyst assistant for the "Power Law" framework application. You help users understand market regimes, signals, cycles, data series, and the overall macro framework.

Answer questions clearly and concisely. Reference specific metrics, thresholds, and regime definitions when relevant. If the user asks about current data values, explain what the metrics mean and how to interpret them — you don't have access to live data, but you know the framework deeply.

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

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT + knowledge },
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
