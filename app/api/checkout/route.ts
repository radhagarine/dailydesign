import { NextResponse } from 'next/server';
import { stripe, PLANS, isStripeEnabled } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscribers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
}

export async function POST(req: Request) {
    // Check if Stripe is configured
    if (!isStripeEnabled() || !stripe) {
        return NextResponse.json(
            { error: 'Payment system is not configured' },
            { status: 503 }
        );
    }

    try {
        const body = await req.json();
        const { plan, email } = body;

        // Validate plan
        if (!plan || !['monthly', 'annual'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const selectedPlan = PLANS[plan as keyof typeof PLANS];

        if (!selectedPlan.priceId) {
            return NextResponse.json(
                { error: 'Price not configured for this plan' },
                { status: 503 }
            );
        }

        const baseUrl = getBaseUrl();

        // Find or create subscriber
        let subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email))
            .get();

        let customerId = subscriber?.stripeCustomerId;

        // Create Stripe customer if needed
        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    subscriberId: subscriber?.id?.toString() || 'pending',
                },
            });
            customerId = customer.id;

            // Update subscriber with Stripe customer ID
            if (subscriber) {
                await db
                    .update(subscribers)
                    .set({ stripeCustomerId: customerId })
                    .where(eq(subscribers.email, email))
                    .run();
            }
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/#pricing`,
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            customer_update: {
                address: 'auto',
            },
            metadata: {
                plan,
                email,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
