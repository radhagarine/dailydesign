import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, referrals } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// GET: Look up referral code details (for the referral landing page)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
    }

    const referrer = await db
        .select({ id: subscribers.id, email: subscribers.email })
        .from(subscribers)
        .where(eq(subscribers.referralCode, code))
        .get();

    if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Count successful referrals
    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, referrer.id))
        .get();

    return NextResponse.json({
        valid: true,
        referrerEmail: referrer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // mask email
        referralCount: countResult?.count || 0,
    });
}

// POST: Get referral info for a subscriber (by unsubscribe token)
export async function POST(req: Request) {
    const body = await req.json();
    const { token } = body;

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const subscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.unsubscribeToken, token))
        .get();

    if (!subscriber) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    // Count their referrals
    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, subscriber.id))
        .get();

    // Count granted rewards
    const rewardsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .where(sql`${referrals.referrerId} = ${subscriber.id} AND ${referrals.rewardStatus} = 'granted'`)
        .get();

    return NextResponse.json({
        referralCode: subscriber.referralCode,
        totalReferrals: countResult?.count || 0,
        rewardsGranted: rewardsResult?.count || 0,
    });
}
