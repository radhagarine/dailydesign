# Developer Notes

Quick reference for debugging, testing, and understanding the system's key flows.

---

## Table of Contents

1. [User Flows & Known Issues](#user-flows--known-issues)
2. [Email System](#email-system)
3. [Testing as Different User Types](#testing-as-different-user-types)
4. [Debugging the Daily Cron](#debugging-the-daily-cron)
5. [Useful Admin SQL Queries](#useful-admin-sql-queries)
6. [Key Files Reference](#key-files-reference)

---

## User Flows & Known Issues

### Flow 1: Free Signup (Newsletter)

1. User enters email in `NewsletterSignup` → POST `/api/subscribe`
2. Subscriber created in DB with `status = 'active'`, `free_access = 0`
3. User is redirected to `/samples/scenario-1`

**Known issues:**
- No welcome/confirmation email is sent on signup. The subscriber's first email arrives as a weekly teaser (up to 7 days later).
- The `NewsletterSignup` component shows "Free daily scenarios." — this is **wrong**. Free subscribers only receive a **weekly** teaser email. Daily emails go to paid subscribers only.
- If the user navigates to `/archive` after signing up (no cookie set), they hit the email gate (`ArchiveAccessGate`), which is expected but may feel broken.

### Flow 2: Paid Checkout

1. User clicks pricing button → `PricingButton` shows email input
2. Email submitted → POST `/api/checkout` → Stripe session created → redirect to Stripe
3. After payment → Stripe webhook fires → `subscriptions` table updated
4. User lands on `/checkout/success` → session verified via `/api/checkout/verify`

**Known issues:**
- After checkout, the success page shows a "Browse the Archive" CTA, but the user has **no cookie set** yet. Clicking it sends them to `ArchiveAccessGate` (email gate) — confusing right after paying.
- The fix: send a welcome email from the Stripe webhook (`checkout.session.completed`) containing a `?token=` link, so the user can click it to get their cookie and access the archive.
- There is no welcome email sent currently from the webhook.

### Flow 3: Getting the Auth Cookie

The `subscriber_token` cookie is the only way the site recognises a visitor. It is set in two ways:
- Clicking any email link that includes `?token=<unsubscribe_token>` — middleware intercepts, sets the cookie, redirects to the clean URL.
- Requesting a magic link from `/archive` (via `ArchiveAccessGate`) → `/api/auth/magic-link` sends an email with the token link.

A new user who signs up and never receives or clicks an email link will never have a cookie, and the site will treat them as unauthenticated.

### Flow 4: Access Code Redemption

1. User clicks "Have an access code?" on the homepage pricing section
2. Enters email + code → POST `/api/redeem`
3. On success, `free_access = 1` is set on the subscriber row → full paid access

---

## Email System

### Who receives what

| Subscriber type | Email | Schedule |
|----------------|-------|----------|
| **Paid** (active/trialing Stripe sub OR `free_access = 1`) | Full daily scenario | Every day at 6 AM UTC |
| **Free** (signed up but no active subscription) | Weekly teaser (problem + framework names only, no answers) | Every Sunday at 10 AM UTC |

### Cron jobs (configured in `vercel.json`)

| Route | Schedule | Purpose |
|-------|----------|---------|
| `/api/cron/daily-challenge` | `0 6 * * *` | Sends full scenario to paid subscribers |
| `/api/cron/pre-generate-weekly` | `0 3 * * 0` | Pre-generates 7 scenarios for the week ahead (Sunday 3 AM UTC) |
| `/api/cron/weekly-teaser` | `0 10 * * 0` | Sends teaser to free subscribers (Sunday 10 AM UTC) |

### How scenario delivery works

1. `pre-generate-weekly` runs every Sunday → calls `/api/admin/pre-generate` → generates 7 scenarios, stores them with `scenario_status = 'pending'` and `scheduled_for = <target date>`.
2. `daily-challenge` runs each morning → checks for a `pending` scenario scheduled for today → uses it (or generates on-the-fly if none found) → sends to paid subscribers → marks scenario `sent`.

**Idempotency caveat:** The daily cron's idempotency guard checks `generatedAt` (time of generation) against today's date. Pre-generated scenarios have `generatedAt` set on Sunday (when they were created), not today. On a cron retry, this guard may fail to detect the scenario was already sent, and a second email could be sent. This is a known bug.

### Paid subscriber check

`lib/subscribers.ts → getActiveSubscribersByTier()` partitions all `active` subscribers:
- **Paid bucket**: subscriber has a row in `subscriptions` with `status IN ('active', 'trialing')` **OR** `free_access = 1`
- **Free bucket**: everyone else

---

## Testing as Different User Types

### State matrix

| Desired state | How to achieve |
|---------------|---------------|
| Unauthenticated visitor | Clear site cookies in browser |
| Free subscriber (weekly email only) | Sign up on homepage; ensure `free_access = 0` in DB |
| Paid subscriber (daily email + full archive) | Set `free_access = 1` in DB (see below) |
| Stripe subscriber | Complete a real Stripe test-mode checkout |

### Setting `free_access = 1` (quickest paid test)

**Option A — Drizzle Studio (recommended for local dev):**
```bash
npm run db:studio
```
Opens at `http://localhost:4983`. Navigate to `subscribers`, find your row, set `free_access` to `1`.

**Option B — Turso CLI:**
```bash
turso db shell <your-db-name> \
  "UPDATE subscribers SET free_access = 1 WHERE email = 'your@email.com'"
```

To revert to free:
```bash
turso db shell <your-db-name> \
  "UPDATE subscribers SET free_access = 0 WHERE email = 'your@email.com'"
```

### Getting the auth cookie for your test user

Without clicking an email link, you have no cookie. To set it manually:

1. Find your `unsubscribe_token` via the admin SQL page (`/admin`):
   ```sql
   SELECT email, unsubscribe_token FROM subscribers WHERE email = 'your@email.com'
   ```
2. Visit `http://localhost:3000/?token=<unsubscribe_token>` (or your prod URL)
3. Middleware intercepts, sets the `subscriber_token` cookie, redirects to `/`

You're now recognised as a logged-in subscriber. Combined with `free_access = 1`, you'll have full paid access.

---

## Debugging the Daily Cron

Since Vercel free tier has no log retention, use the database to reconstruct what happened.

### Step 1 — Did the cron run and complete?

```sql
-- Shows every completed cron run (one row per send batch)
SELECT id, subject, sent_at, recipient_count
FROM emails
ORDER BY sent_at DESC
LIMIT 20
```
`sent_at` is a Unix timestamp. If the most recent row is older than 24 hours, the cron either didn't run or failed before inserting the log record.

### Step 2 — What was the per-recipient outcome?

```sql
-- Shows individual send attempts with status
SELECT email_type, recipient_email, send_status, attempts, last_error, last_attempt_at
FROM email_send_log
ORDER BY last_attempt_at DESC
LIMIT 30
```
- `email_type = 'daily'` → from daily cron
- `email_type = 'teaser'` → from weekly teaser cron
- `send_status` values: `sent`, `failed`, `dead_letter`

### Step 3 — Are subscribers being found?

```sql
-- Check who is in the paid bucket
SELECT s.email, s.status, s.free_access, sub.status as stripe_status, sub.plan
FROM subscribers s
LEFT JOIN subscriptions sub ON sub.subscriber_id = s.id
WHERE s.status = 'active'
```
If `stripe_status` is NULL and `free_access = 0`, that subscriber is in the free bucket and will only get weekly teasers.

### Step 4 — Check scenario status

```sql
-- See what scenarios were sent recently and what's pending
SELECT slug, title, scenario_status, generated_at, scheduled_for
FROM scenarios
ORDER BY generated_at DESC
LIMIT 14
```
- `scenario_status = 'sent'` → processed by daily cron
- `scenario_status = 'pending'` → pre-generated, waiting for cron
- No `pending` row for today → cron will generate on-the-fly (requires OpenAI API)

### Common failure reasons

| Symptom | Likely cause |
|---------|-------------|
| `emails` table has no recent rows | Cron errored before completion (OpenAI timeout, DB error) |
| `emails` row exists but `recipient_count = 0` | No paid subscribers found — check `subscriptions` table |
| `send_status = 'failed'` in `email_send_log` | Resend API error — check `last_error` column |
| Emails arrive weekly not daily | Subscriber is in free bucket — `subscriptions` table empty or Stripe webhook not configured |
| Stripe webhook not firing | Check `STRIPE_WEBHOOK_SECRET` env var; verify webhook URL registered in Stripe dashboard points to `<your-url>/api/webhooks/stripe` |

---

## Useful Admin SQL Queries

All queries can be run from the `/admin` page (Raw SQL Query box — SELECT only).

```sql
-- All subscribers with their subscription and access status
SELECT s.id, s.email, s.status, s.free_access,
       sub.status AS stripe_status, sub.plan, sub.current_period_end
FROM subscribers s
LEFT JOIN subscriptions sub ON sub.subscriber_id = s.id
ORDER BY s.joined_at DESC;

-- Emails sent in the last 7 days
SELECT subject, sent_at, recipient_count
FROM emails
WHERE sent_at > strftime('%s', 'now', '-7 days')
ORDER BY sent_at DESC;

-- Failed email deliveries
SELECT recipient_email, email_type, attempts, last_error, last_attempt_at
FROM email_send_log
WHERE send_status IN ('failed', 'dead_letter')
ORDER BY last_attempt_at DESC;

-- Pre-generated scenarios scheduled for the next 7 days
SELECT slug, title, scenario_status, scheduled_for
FROM scenarios
WHERE scheduled_for > strftime('%s', 'now')
  AND scenario_status = 'pending'
ORDER BY scheduled_for ASC;

-- Access codes (redeemed vs available)
SELECT code, expires_at, redeemed_by, redeemed_at
FROM access_codes
ORDER BY created_at DESC;
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/schema.ts` | All DB table definitions |
| `lib/cookies.ts` | `getSubscriberFromCookie()`, `isSubscriberPaid()` |
| `lib/subscribers.ts` | `getActiveSubscribersByTier()` — paid vs free partition |
| `lib/content-strategy.ts` | Theme/problem-type rotation logic for daily scenarios |
| `app/api/cron/daily-challenge/route.ts` | Daily scenario generation + email blast |
| `app/api/cron/weekly-teaser/route.ts` | Weekly preview email for free subscribers |
| `app/api/cron/pre-generate-weekly/route.ts` | Triggers bulk pre-generation for the week |
| `app/api/admin/pre-generate/route.ts` | Actual pre-generation logic (POST = generate, GET = status) |
| `app/api/webhooks/stripe/route.ts` | Stripe event handler — creates/updates `subscriptions` rows |
| `middleware.ts` | Sets `subscriber_token` cookie from `?token=` URL param; rate limiting |
| `vercel.json` | Cron schedules and function timeouts |
