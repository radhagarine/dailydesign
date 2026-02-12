import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { randomBytes } from 'crypto';

// Generate a unique unsubscribe token
export function generateUnsubscribeToken(): string {
    return randomBytes(32).toString('hex');
}

// Generate an access code: DAILY- + 16 random hex chars (uppercase)
export function generateAccessCode(): string {
    return `DAILY-${randomBytes(8).toString('hex').toUpperCase()}`;
}

// Generate a short referral code (8 chars, URL-safe)
export function generateReferralCode(): string {
    return randomBytes(4).toString('hex');
}

// Generate a URL-friendly slug from title and date
export function generateScenarioSlug(title: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0]; // 2024-01-15
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    return `${dateStr}-${slug}`;
}

export const subscribers = sqliteTable('subscribers', {
    id: integer('id').primaryKey(),
    email: text('email').notNull().unique(),
    status: text('status').default('active'), // active, unsubscribed
    unsubscribeToken: text('unsubscribe_token').notNull().unique().$defaultFn(() => generateUnsubscribeToken()),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    // User preferences (optional, collected during onboarding)
    yearsExperience: text('years_experience'), // '8-12', '12-16', '16-20', '20+'
    primaryRole: text('primary_role'), // 'backend', 'fullstack', 'infrastructure'
    prepStage: text('prep_stage'), // 'starting', 'active', 'scheduled'
    timezone: text('timezone').default('UTC'),
    // Stripe integration
    stripeCustomerId: text('stripe_customer_id'),
    // Free access override (grants paid-tier access without Stripe subscription)
    freeAccess: integer('free_access', { mode: 'boolean' }).default(false),
    // Referral
    referralCode: text('referral_code').unique().$defaultFn(() => generateReferralCode()),
    referredBy: integer('referred_by'), // subscriber ID of referrer
}, (table) => ({
    statusIdx: index('subscriber_status_idx').on(table.status),
    stripeCustomerIdx: index('subscriber_stripe_customer_idx').on(table.stripeCustomerId),
}));

export const emails = sqliteTable('emails', {
    id: integer('id').primaryKey(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    sentAt: integer('sent_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    recipientCount: integer('recipient_count').default(0),
});

export const scenarios = sqliteTable('scenarios', {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    // Full scenario content as JSON (template.md format)
    // Contains: metadata, problem, framework_steps, interview_simulation, summary, reflection_prompts
    content: text('content').notNull(), // Full InterviewScenario JSON
    // Metadata for querying/filtering
    theme: text('theme').notNull(),
    problemType: text('problem_type').notNull(), // 'SYSTEM_DESIGN' | 'TACTICAL'
    focusArea: text('focus_area'),
    generatedAt: integer('generated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    // Pre-generation scheduling
    scheduledFor: integer('scheduled_for', { mode: 'timestamp' }),
    scenarioStatus: text('scenario_status').default('sent'), // 'pending' | 'sent' | 'failed' (default 'sent' for backwards compat)
}, (table) => ({
    slugIdx: index('slug_idx').on(table.slug),
    generatedAtIdx: index('generated_at_idx').on(table.generatedAt),
    themeIdx: index('theme_idx').on(table.theme),
    scheduledForIdx: index('scheduled_for_idx').on(table.scheduledFor),
    scenarioStatusIdx: index('scenario_status_idx').on(table.scenarioStatus),
}));

export const subscriptions = sqliteTable('subscriptions', {
    id: integer('id').primaryKey(),
    subscriberId: integer('subscriber_id').notNull().references(() => subscribers.id),
    stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
    stripePriceId: text('stripe_price_id').notNull(),
    status: text('status').notNull(), // active, canceled, past_due, trialing, etc.
    plan: text('plan').notNull(), // 'monthly' | 'annual'
    currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
    currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    subscriberIdx: index('subscription_subscriber_idx').on(table.subscriberId),
    stripeSubIdx: index('stripe_subscription_idx').on(table.stripeSubscriptionId),
}));

export const referrals = sqliteTable('referrals', {
    id: integer('id').primaryKey(),
    referrerId: integer('referrer_id').notNull().references(() => subscribers.id),
    referredId: integer('referred_id').notNull().references(() => subscribers.id),
    rewardStatus: text('reward_status').default('pending'), // 'pending' | 'granted' | 'ineligible'
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    referrerIdx: index('referral_referrer_idx').on(table.referrerId),
    referredIdx: index('referral_referred_idx').on(table.referredId),
}));

export const emailSendLog = sqliteTable('email_send_log', {
    id: integer('id').primaryKey(),
    recipientEmail: text('recipient_email').notNull(),
    subject: text('subject').notNull(),
    sendStatus: text('send_status').notNull().default('pending'), // 'pending' | 'sent' | 'failed' | 'dead_letter'
    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' }),
    lastError: text('last_error'),
    emailType: text('email_type').notNull(), // 'daily' | 'teaser'
    scenarioSlug: text('scenario_slug'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    statusIdx: index('email_send_log_status_idx').on(table.sendStatus),
    recipientIdx: index('email_send_log_recipient_idx').on(table.recipientEmail),
}));

export const accessCodes = sqliteTable('access_codes', {
    id: integer('id').primaryKey(),
    code: text('code').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    redeemedBy: integer('redeemed_by').references(() => subscribers.id),
    redeemedAt: integer('redeemed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    codeIdx: index('access_code_idx').on(table.code),
}));

export const emailEvents = sqliteTable('email_events', {
    id: integer('id').primaryKey(),
    resendEmailId: text('resend_email_id').notNull(),
    recipientEmail: text('recipient_email').notNull(),
    eventType: text('event_type').notNull(), // 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
    metadata: text('metadata'), // JSON for extra event data (e.g. click URL)
    occurredAt: integer('occurred_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
    resendEmailIdx: index('email_event_resend_idx').on(table.resendEmailId),
    recipientIdx: index('email_event_recipient_idx').on(table.recipientEmail),
    eventTypeIdx: index('email_event_type_idx').on(table.eventType),
}));
