import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'public', 'data', 'japan', 'japan-1980s.csv');
        const csvContent = readFileSync(filePath, 'utf8');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error reading Japan CSV:', error);
        return NextResponse.json(
            { error: 'Failed to load Japan data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}