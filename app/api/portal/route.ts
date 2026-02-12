import { NextResponse } from 'next/server';
import { stripe, isStripeEnabled } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/utils';
import { getSubscriberFromCookie } from '@/lib/cookies';

export async function POST(req: Request) {
    if (!isStripeEnabled() || !stripe) {
        return NextResponse.json(
            { error: 'Payment system is not configured' },
            { status: 503 }
        );
    }

    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Authenticate: require cookie-based auth and ensure the email matches
        const cookieSubscriber = await getSubscriberFromCookie();
        if (!cookieSubscriber || cookieSubscriber.email !== normalizedEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Look up subscriber
        const subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, normalizedEmail))
            .get();

        if (!subscriber) {
            return NextResponse.json(
                { error: 'No account found for this email' },
                { status: 404 }
            );
        }

        if (!subscriber.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No billing information found. You may not have an active subscription.' },
                { status: 404 }
            );
        }

        const baseUrl = getBaseUrl();

        const session = await stripe.billingPortal.sessions.create({
            customer: subscriber.stripeCustomerId,
            return_url: `${baseUrl}/`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
