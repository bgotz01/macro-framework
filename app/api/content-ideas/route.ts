import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'data', 'content-ideas.json');

function ensureFile() {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]');
}

export async function GET() {
    ensureFile();
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    ensureFile();
    const ideas = await req.json();
    fs.writeFileSync(FILE_PATH, JSON.stringify(ideas, null, 2));
    return NextResponse.json({ ok: true });
}
