import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, referrals, generateUnsubscribeToken } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { email, ref } = await req.json();

        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email))
            .get();

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already subscribed',
                isNew: false
            });
        }

        // Look up referrer if code provided
        let referrerId: number | undefined;
        if (ref && typeof ref === 'string') {
            const referrer = await db
                .select({ id: subscribers.id })
                .from(subscribers)
                .where(eq(subscribers.referralCode, ref))
                .get();

            if (referrer) {
                referrerId = referrer.id;
            }
        }

        // Create new subscriber with token
        const token = generateUnsubscribeToken();
        await db.insert(subscribers).values({
            email,
            unsubscribeToken: token,
            referredBy: referrerId || null,
        }).run();

        // If referred, create referral tracking record
        if (referrerId) {
            const newSubscriber = await db
                .select({ id: subscribers.id })
                .from(subscribers)
                .where(eq(subscribers.email, email))
                .get();

            if (newSubscriber) {
                await db.insert(referrals).values({
                    referrerId,
                    referredId: newSubscriber.id,
                    rewardStatus: 'pending',
                }).run();
            }
        }

        return NextResponse.json({
            success: true,
            token,
            isNew: true
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
