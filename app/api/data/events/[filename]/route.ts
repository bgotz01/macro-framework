import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // Security: Only allow CSV files and prevent directory traversal
        if (!filename.endsWith('.csv') || filename.includes('..') || filename.includes('/')) {
            return NextResponse.json(
                { error: 'Invalid filename' },
                { status: 400 }
            );
        }

        const filePath = join(process.cwd(), 'public', 'data', 'events', filename);
        const csvContent = readFileSync(filePath, 'utf8');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        const resolvedParams = await params;
        console.error(`Error reading events CSV file ${resolvedParams.filename}:`, error);
        return NextResponse.json(
            { error: `Failed to load events data: ${resolvedParams.filename}` },
            { status: 500 }
        );
    }
}