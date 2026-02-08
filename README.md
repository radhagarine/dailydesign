# DailyDesign

Daily system design interview prep for senior engineers targeting Staff/Principal roles at FAANG and high-growth companies.

Each day, subscribers receive an AI-generated system design scenario with bad/good/best answer comparisons to calibrate their interview responses.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: [Turso](https://turso.tech) (libsql) + [Drizzle ORM](https://orm.drizzle.team)
- **AI**: OpenAI API (gpt-4o-mini) with Zod Structured Outputs
- **Email**: [Resend](https://resend.com)
- **Payments**: [Stripe](https://stripe.com) (checkout + webhooks)
- **Styling**: Tailwind CSS
- **Hosting**: [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account and database
- An [OpenAI](https://platform.openai.com) API key
- A [Resend](https://resend.com) API key

### 1. Clone and install

```bash
git clone <repo-url>
cd interviewprep
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for scenario generation |
| `RESEND_API_KEY` | Yes | Resend API key for email delivery |
| `CRON_SECRET` | Yes | Random secret to protect cron endpoints (generate with `openssl rand -hex 32`) |
| `TURSO_DATABASE_URL` | Yes | Turso database URL (`libsql://your-db.turso.io`) |
| `TURSO_AUTH_TOKEN` | Yes | Turso authentication token |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for email links (auto-detected on Vercel) |
| `EMAIL_FROM` | No | Sender address for emails |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for payments) |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PRICE_MONTHLY` | No | Stripe monthly price ID |
| `STRIPE_PRICE_ANNUAL` | No | Stripe annual price ID |

### 3. Set up the database

```bash
# Create a Turso database
turso db create dailydesign

# Get your credentials
turso db show dailydesign --url
turso db tokens create dailydesign

# Push the schema
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema directly to database (dev only) |
| `npm run db:studio` | Open Drizzle Studio GUI to browse tables |

## Project Structure

```
app/
  page.tsx                          # Landing page
  archive/page.tsx                  # Scenario archive
  scenarios/[slug]/page.tsx         # Individual scenario viewer
  admin/page.tsx                    # Admin dashboard
  welcome/page.tsx                  # Post-signup welcome
  checkout/success/page.tsx         # Stripe checkout success
  api/
    subscribe/route.ts              # Newsletter signup
    unsubscribe/route.ts            # One-click unsubscribe
    preferences/route.ts            # User preference updates
    checkout/route.ts               # Stripe checkout session
    webhooks/stripe/route.ts        # Stripe webhook handler
    admin/
      tables/route.ts               # Admin data access
      pre-generate/route.ts         # Manual scenario pre-generation
    cron/
      daily-challenge/route.ts      # Daily cron: generate + email
      pre-generate-weekly/route.ts  # Weekly cron: pre-generate 7 days
lib/
  ai.ts                             # OpenAI scenario generation
  db.ts                             # Database connection (Turso)
  schema.ts                         # Drizzle ORM schema
  email.ts                          # Resend email helper
  content-strategy.ts               # Theme/problem rotation logic
components/
  InterviewScenario.tsx              # Main scenario viewer component
  DesignProblem.tsx                  # Design problem presentation
  NewsletterSignup.tsx               # Email capture form
  PricingButton.tsx                  # Stripe checkout integration
```

## Content Strategy

Scenarios rotate through 4 weekly themes:

1. **Scale** - Architectures for 100M+ users, sharding, global distribution
2. **Performance** - Latency, query optimization, capacity planning
3. **Reliability** - Cascading failures, circuit breakers, disaster recovery
4. **Architecture** - Microservices, event-driven systems, data pipelines

Problem type alternates by day: System Design (Tue/Thu/Sat) and Tactical (Mon/Wed/Fri).

## Deploying to Vercel

### 1. Connect your repository

Link your GitHub repo to [Vercel](https://vercel.com/new).

### 2. Set environment variables

In your Vercel project, go to **Settings > Environment Variables** and add all required variables from the table above. Make sure they are enabled for the **Production** environment.

**Important**: `CRON_SECRET` must be set in Vercel for cron jobs to authenticate properly.

### 3. Deploy

Push to your main branch. Vercel will build and deploy automatically.

### 4. Set up the database

After the first deploy, push your schema to the production database:

```bash
# Make sure .env.local has your production Turso credentials
npm run db:push
```

### 5. Verify cron jobs

The `vercel.json` configures two cron jobs:

| Schedule | Endpoint | Description |
|----------|----------|-------------|
| `0 6 * * *` (6 AM UTC daily) | `/api/cron/daily-challenge` | Generates a scenario and emails all subscribers |
| `0 3 * * 0` (3 AM UTC Sunday) | `/api/cron/pre-generate-weekly` | Pre-generates scenarios for the upcoming week |

To verify they're registered, go to **Settings > Cron Jobs** in your Vercel dashboard.

To test manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/daily-challenge
```

### Vercel Plan Considerations

- **Hobby plan**: Function timeout capped at 60s. The daily challenge route needs ~120s for AI generation, so it may timeout. Consider upgrading to Pro or relying on pre-generated scenarios.
- **Pro plan**: Supports up to 300s function timeout, which covers all routes.

## Database Schema

| Table | Description |
|-------|-------------|
| `subscribers` | Email list with unsubscribe tokens, preferences, Stripe customer IDs |
| `scenarios` | AI-generated interview content (JSON blob in `content` column) |
| `emails` | Sent email log with recipient counts |
| `subscriptions` | Stripe subscription tracking (plan, status, billing period) |

Browse your data with `npm run db:studio` or via the [Turso dashboard](https://app.turso.tech).

## License

Private project. All rights reserved.
