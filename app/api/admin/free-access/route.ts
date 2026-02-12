import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyBearerToken } from '@/lib/auth';

function authenticate(request: NextRequest): NextResponse | null {
    if (!verifyBearerToken(request.headers.get('authorization'), process.env.CRON_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

// POST /api/admin/free-access — Grant free access
// Body: { email: string }
export async function POST(request: NextRequest) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email.toLowerCase().trim()))
            .get();

        if (!subscriber) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        await db
            .update(subscribers)
            .set({ freeAccess: true })
            .where(eq(subscribers.id, subscriber.id))
            .run();

        return NextResponse.json({
            success: true,
            message: `Free access granted to ${subscriber.email}`,
            subscriber: { id: subscriber.id, email: subscriber.email, freeAccess: true },
        });
    } catch (error) {
        console.error('Grant free access error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/free-access — Revoke free access
// Body: { email: string }
export async function DELETE(request: NextRequest) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email.toLowerCase().trim()))
            .get();

        if (!subscriber) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        await db
            .update(subscribers)
            .set({ freeAccess: false })
            .where(eq(subscribers.id, subscriber.id))
            .run();

        return NextResponse.json({
            success: true,
            message: `Free access revoked for ${subscriber.email}`,
            subscriber: { id: subscriber.id, email: subscriber.email, freeAccess: false },
        });
    } catch (error) {
        console.error('Revoke free access error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/admin/free-access — List all subscribers with free access
export async function GET(request: NextRequest) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        const freeAccessSubscribers = await db
            .select({ id: subscribers.id, email: subscribers.email, status: subscribers.status })
            .from(subscribers)
            .where(eq(subscribers.freeAccess, true))
            .all();

        return NextResponse.json({
            count: freeAccessSubscribers.length,
            subscribers: freeAccessSubscribers,
        });
    } catch (error) {
        console.error('List free access error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
