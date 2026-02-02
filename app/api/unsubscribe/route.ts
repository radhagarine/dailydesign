import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        // Find subscriber by token
        const subscriber = await db
            .select()
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
                email: subscriber.email
            });
        }

        // Update status to unsubscribed
        await db
            .update(subscribers)
            .set({ status: 'unsubscribed' })
            .where(eq(subscribers.unsubscribeToken, token))
            .run();

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed',
            email: subscriber.email
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Also support POST for form submissions
export async function POST(req: Request) {
    const body = await req.json();
    const token = body.token;

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Reuse GET logic
    const url = new URL(req.url);
    url.searchParams.set('token', token);
    const fakeReq = new Request(url.toString());
    return GET(fakeReq);
}
