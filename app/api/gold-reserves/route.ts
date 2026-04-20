import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'public', 'data', 'case-study', 'gold-reserves.csv');
        const csvContent = readFileSync(filePath, 'utf8');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Error reading gold reserves CSV:', error);
        return NextResponse.json(
            { error: 'Failed to load gold reserves data' },
            { status: 500 }
        );
    }
}