import { NextResponse } from 'next/server';
import { stripe, isStripeEnabled } from '@/lib/stripe';

export async function GET(req: Request) {
    if (!isStripeEnabled() || !stripe) {
        return NextResponse.json(
            { error: 'Payment system is not configured' },
            { status: 503 }
        );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Basic format validation — Stripe session IDs start with cs_
    if (!sessionId.startsWith('cs_')) {
        return NextResponse.json({ error: 'Invalid session format' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({
                verified: false,
                reason: 'Payment not completed',
            });
        }

        return NextResponse.json({
            verified: true,
            email: session.customer_details?.email || session.metadata?.email || null,
            plan: session.metadata?.plan || null,
        });
    } catch (error: unknown) {
        // Stripe throws for invalid session IDs
        const stripeError = error as { type?: string };
        if (stripeError.type === 'StripeInvalidRequestError') {
            return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
        }
        console.error('Session verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
