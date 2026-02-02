import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set - payment features will be disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
        typescript: true,
    })
    : null;

// Price IDs from Stripe Dashboard
export const PRICES = {
    monthly: process.env.STRIPE_PRICE_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ANNUAL || '',
};

// Plan details
export const PLANS = {
    monthly: {
        name: 'Monthly',
        price: 20,
        interval: 'month' as const,
        priceId: PRICES.monthly,
    },
    annual: {
        name: 'Annual',
        price: 180,
        interval: 'year' as const,
        priceId: PRICES.annual,
    },
};

export function isStripeEnabled(): boolean {
    return !!stripe && !!PRICES.monthly && !!PRICES.annual;
}
