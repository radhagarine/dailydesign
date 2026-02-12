import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscribers, subscriptions } from '@/lib/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type Stripe from 'stripe';

// In-memory idempotency cache for processed webhook events.
// Prevents duplicate processing within the same serverless instance.
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL = 5 * 60 * 1000; // 5 minutes

function markEventProcessed(eventId: string) {
    processedEvents.set(eventId, Date.now());
    // Clean up old entries
    if (processedEvents.size > 1000) {
        const now = Date.now();
        processedEvents.forEach((timestamp, id) => {
            if (now - timestamp > IDEMPOTENCY_TTL) processedEvents.delete(id);
        });
    }
}

export async function POST(req: Request) {
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe not configured' },
            { status: 503 }
        );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 }
        );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Idempotency check: skip already-processed events
    if (processedEvents.has(event.id)) {
        return NextResponse.json({ received: true, duplicate: true });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        markEventProcessed(event.id);
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { customer, subscription, metadata } = session;

    if (!customer || !subscription || !metadata?.email) {
        console.error('Missing data in checkout session:', { customer, subscription, metadata });
        return;
    }

    const customerId = typeof customer === 'string' ? customer : customer.id;
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;

    // Find or create subscriber
    let subscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, metadata.email))
        .get();

    if (!subscriber) {
        // Create subscriber if they do not exist
        await db.insert(subscribers).values({
            email: metadata.email,
            stripeCustomerId: customerId,
            status: 'active',
        }).run();

        subscriber = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, metadata.email))
            .get();
    } else {
        // Update with Stripe customer ID
        await db
            .update(subscribers)
            .set({ stripeCustomerId: customerId, status: 'active' })
            .where(eq(subscribers.email, metadata.email))
            .run();
    }

    console.log(`Checkout completed for ${metadata.email}, subscription: ${subscriptionId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    // Find subscriber by Stripe customer ID
    const subscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.stripeCustomerId, customerId))
        .get();

    if (!subscriber) {
        console.error('Subscriber not found for customer:', customerId);
        return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId === process.env.STRIPE_PRICE_ANNUAL ? 'annual' : 'monthly';

    // Check if subscription record exists
    const existingSub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .get();

    // Handle different Stripe API versions
    const periodStart = (subscription as any).current_period_start;
    const periodEnd = (subscription as any).current_period_end;

    const subscriptionData = {
        subscriberId: subscriber.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId || '',
        status: subscription.status,
        plan,
        currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
        updatedAt: new Date(),
    };

    if (existingSub) {
        await db
            .update(subscriptions)
            .set(subscriptionData)
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
            .run();
    } else {
        await db.insert(subscriptions).values({
            ...subscriptionData,
            createdAt: new Date(),
        }).run();
    }

    // Update subscriber status based on subscription status
    // - Don't overwrite 'unsubscribed' (user explicitly opted out of emails)
    // - Treat 'past_due' as still active (grace period while Stripe retries payment)
    if (subscriber.status !== 'unsubscribed') {
        const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status);
        await db
            .update(subscribers)
            .set({ status: isActive ? 'active' : 'inactive' })
            .where(eq(subscribers.id, subscriber.id))
            .run();
    }

    console.log(`Subscription ${subscription.id} updated: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Update subscription record
    await db
        .update(subscriptions)
        .set({
            status: 'canceled',
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .run();

    // Find and update subscriber
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const subscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.stripeCustomerId, customerId))
        .get();

    if (subscriber) {
        // Don't overwrite 'unsubscribed' status
        if (subscriber.status === 'unsubscribed') {
            console.log(`Subscription ${subscription.id} canceled, subscriber already unsubscribed`);
            return;
        }

        // Check if they have any other active subscriptions before revoking access
        const otherActiveSubs = await db
            .select({ id: subscriptions.id })
            .from(subscriptions)
            .where(and(
                eq(subscriptions.subscriberId, subscriber.id),
                inArray(subscriptions.status, ['active', 'trialing', 'past_due']),
            ))
            .all();

        // Only mark inactive if no other active subs AND no freeAccess
        if (otherActiveSubs.length === 0 && !subscriber.freeAccess) {
            await db
                .update(subscribers)
                .set({ status: 'inactive' })
                .where(eq(subscribers.id, subscriber.id))
                .run();
        }
    }

    console.log(`Subscription ${subscription.id} canceled`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

    if (!customerId) return;

    // Look up subscriber for actionable logging
    const subscriber = await db
        .select({ id: subscribers.id, email: subscribers.email })
        .from(subscribers)
        .where(eq(subscribers.stripeCustomerId, customerId))
        .get();

    console.error(`Payment failed for customer ${customerId}${subscriber ? ` (${subscriber.email})` : ''}, invoice: ${invoice.id}, attempt: ${invoice.attempt_count}`);

    // Note: Stripe automatically retries failed payments (Smart Retries).
    // The subscriber keeps access during 'past_due' status (grace period).
    // If all retries fail, Stripe sends 'customer.subscription.deleted' which
    // triggers handleSubscriptionDeleted to revoke access.
}
