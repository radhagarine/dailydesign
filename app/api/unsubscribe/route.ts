import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET only checks status — does NOT modify anything (safe for email scanners / link prefetch)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        const subscriber = await db
            .select({ status: subscribers.status })
            .from(subscribers)
            .where(eq(subscribers.unsubscribeToken, token))
            .get();

        if (!subscriber) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
        }

        return NextResponse.json({
            valid: true,
            alreadyUnsubscribed: subscriber.status === 'unsubscribed',
        });
    } catch (error) {
        console.error('Unsubscribe check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST executes the actual unsubscribe (state-changing operation)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const token = body.token;

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const subscriber = await db
            .select({ status: subscribers.status })
            .from(subscribers)
            .where(eq(subscribers.unsubscribeToken, token))
            .get();

        if (!subscriber) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
        }

        if (subscriber.status === 'unsubscribed') {
            return NextResponse.json({
                success: true,
                message: 'Already unsubscribed',
            });
        }

        await db
            .update(subscribers)
            .set({ status: 'unsubscribed' })
            .where(eq(subscribers.unsubscribeToken, token))
            .run();

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed',
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
