import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accessCodes, subscribers, generateUnsubscribeToken } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/redeem — Redeem an access code
// Body: { email: string, code: string }
export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

        const trimmedCode = code.trim().toUpperCase();
        const trimmedEmail = email.trim().toLowerCase();

        // Look up the code
        const accessCode = await db
            .select()
            .from(accessCodes)
            .where(eq(accessCodes.code, trimmedCode))
            .get();

        if (!accessCode) {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 400 });
        }

        if (accessCode.redeemedBy) {
            return NextResponse.json({ error: 'This code has already been redeemed' }, { status: 400 });
        }

        if (accessCode.expiresAt < new Date()) {
            return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
        }

        // Look up existing subscriber
        let subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, trimmedEmail))
            .get();

        let isNewSubscriber = false;

        if (subscriber && subscriber.status !== 'active') {
            // Reactivate unsubscribed user
            await db
                .update(subscribers)
                .set({ status: 'active', freeAccess: true })
                .where(eq(subscribers.id, subscriber.id));
        } else if (!subscriber) {
            // Auto-subscribe with freeAccess
            const token = generateUnsubscribeToken();
            await db.insert(subscribers).values({
                email: trimmedEmail,
                unsubscribeToken: token,
                freeAccess: true,
            });
            subscriber = await db
                .select()
                .from(subscribers)
                .where(eq(subscribers.email, trimmedEmail))
                .get();
            isNewSubscriber = true;
        } else if (subscriber.freeAccess) {
            return NextResponse.json({ error: 'You already have premium access' }, { status: 400 });
        } else {
            // Existing active subscriber — grant freeAccess
            await db
                .update(subscribers)
                .set({ freeAccess: true })
                .where(eq(subscribers.id, subscriber.id));
        }

        // Mark code as redeemed
        await db
            .update(accessCodes)
            .set({ redeemedBy: subscriber!.id, redeemedAt: new Date() })
            .where(eq(accessCodes.id, accessCode.id));

        const message = isNewSubscriber
            ? 'Welcome! Your account has been created with premium access. You will receive full daily scenarios.'
            : 'Premium access activated! You will now receive full daily scenarios.';

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Redeem access code error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
