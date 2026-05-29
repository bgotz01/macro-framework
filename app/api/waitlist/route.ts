import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { name, email } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        await prisma.waitlist.create({
            data: { name: name.trim(), email: normalizedEmail },
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err: unknown) {
        if (
            err &&
            typeof err === 'object' &&
            'code' in err &&
            (err as { code: string }).code === 'P2002'
        ) {
            return NextResponse.json({ error: 'Already on the waitlist.' }, { status: 409 });
        }
        console.error('[waitlist]', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
