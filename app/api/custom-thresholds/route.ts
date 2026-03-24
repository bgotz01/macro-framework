import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'data', 'custom-thresholds.json');

export async function GET() {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            return NextResponse.json(null);
        }
        const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(null);
    }
}

export async function POST(request: NextRequest) {
    try {
        const thresholds = await request.json();
        fs.writeFileSync(FILE_PATH, JSON.stringify(thresholds, null, 2));
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}
