import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { randomBytes } from 'crypto';

// Generate a unique unsubscribe token
export function generateUnsubscribeToken(): string {
    return randomBytes(32).toString('hex');
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
});

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
}, (table) => ({
    slugIdx: index('slug_idx').on(table.slug),
    generatedAtIdx: index('generated_at_idx').on(table.generatedAt),
    themeIdx: index('theme_idx').on(table.theme),
}));

export const subscriptions = sqliteTable('subscriptions', {
    id: integer('id').primaryKey(),
    subscriberId: integer('subscriber_id').notNull(),
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
