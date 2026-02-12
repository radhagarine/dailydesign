import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, referrals, generateUnsubscribeToken } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { email, ref } = await req.json();

        const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, normalizedEmail))
            .get();

        if (existing) {
            // Handle resubscription: if previously unsubscribed, reactivate
            if (existing.status === 'unsubscribed') {
                await db
                    .update(subscribers)
                    .set({ status: 'active' })
                    .where(eq(subscribers.id, existing.id))
                    .run();
                return NextResponse.json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated.',
                    isNew: false,
                    reactivated: true,
                });
            }

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

        // Create new subscriber (token sent via email, NOT in API response)
        const token = generateUnsubscribeToken();
        await db.insert(subscribers).values({
            email: normalizedEmail,
            unsubscribeToken: token,
            referredBy: referrerId || null,
        }).run();

        // If referred, create referral tracking record
        if (referrerId) {
            const newSubscriber = await db
                .select({ id: subscribers.id })
                .from(subscribers)
                .where(eq(subscribers.email, normalizedEmail))
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
            isNew: true
        });
    } catch (error: any) {
        // Handle race condition: concurrent insert with same email
        if (error.message?.includes('UNIQUE constraint failed')) {
            return NextResponse.json({
                success: true,
                message: 'Already subscribed',
                isNew: false
            });
        }
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
