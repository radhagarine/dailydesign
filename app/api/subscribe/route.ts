import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribers, referrals, generateUnsubscribeToken } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/utils';

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

                // Fire-and-forget welcome-back email
                const baseUrl = getBaseUrl();
                const archiveUrl = `${baseUrl}/archive?token=${existing.unsubscribeToken}`;
                sendEmail({
                    to: normalizedEmail,
                    subject: 'Welcome back to DailyDesign!',
                    html: generateWelcomeEmailHtml(archiveUrl, true),
                }).catch((err) => console.error('Welcome-back email failed:', err));

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

        // Fire-and-forget welcome email
        {
            const baseUrl = getBaseUrl();
            const archiveUrl = `${baseUrl}/archive?token=${token}`;
            sendEmail({
                to: normalizedEmail,
                subject: 'Welcome to DailyDesign — your 7-day trial starts now!',
                html: generateWelcomeEmailHtml(archiveUrl, false),
            }).catch((err) => console.error('Welcome email failed:', err));
        }

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

function generateWelcomeEmailHtml(archiveUrl: string, isReactivation: boolean): string {
    const heading = isReactivation ? 'Welcome back to DailyDesign!' : 'Welcome to DailyDesign!';
    const intro = isReactivation
        ? "Great to have you back! Your subscription is active again."
        : "Thanks for signing up! You'll receive daily system design interview scenarios for the next 7 days — the same content our paid subscribers get.";

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #e5e5e5;">
  <div style="background-color: #262626; border-radius: 8px; padding: 32px; border: 1px solid #333;">
    <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 16px; text-align: center;">${heading}</h1>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">${intro}</p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Each scenario is built for experienced backend engineers (8-20+ years) targeting Staff/Principal roles at FAANG and high-growth companies.</p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${archiveUrl}" style="display: inline-block; padding: 14px 28px; background-color: #0e7490; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Browse the Archive</a>
    </div>
    <p style="color: #9ca3af; font-size: 13px; text-align: center;">Your first daily scenario arrives tomorrow at 6 AM UTC.</p>
  </div>
  <div style="text-align: center; margin-top: 24px;">
    <p style="color: #6b7280; font-size: 12px;">DailyDesign</p>
  </div>
</body>
</html>`;
}
