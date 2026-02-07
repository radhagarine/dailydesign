# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DailyDesign is a Next.js application that delivers daily system design challenge scenarios via email. It generates AI-powered system design interview content targeting experienced backend engineers (8-20+ years) preparing for Staff/Principal roles at FAANG and high-growth companies.

**Core concept**: One-way consumption platform—users read and compare bad/good/best answer patterns to calibrate their interview responses. No interactive features, no typing, no scoring.

## Common Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

# Database (Drizzle + SQLite)
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio GUI
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **AI**: OpenAI API for scenario generation
- **Email**: Resend for daily delivery
- **Payments**: Stripe (checkout + webhooks)
- **Styling**: Tailwind CSS

### Key Data Flow

1. **Daily Cron Job** (`/api/cron/daily-challenge`): Triggered at 6 AM UTC via Vercel Cron
   - Determines theme/problem type using `lib/content-strategy.ts` rotation logic
   - Generates full interview scenario via OpenAI (`lib/ai.ts`)
   - Saves to `scenarios` table with slug
   - Emails all active subscribers with personalized unsubscribe links

2. **Content Strategy** (`lib/content-strategy.ts`): Rotates through 4 themes weekly (scale, performance, reliability, architecture). Problem type alternates by day of week (System Design on Tue/Thu/Sat, Tactical on Mon/Wed/Fri).

3. **Scenario Display** (`/scenarios/[slug]`): Fetches from DB, renders via `InterviewScenario.tsx`—the main component (~1500 lines) that handles the stepped reveal of framework steps and bad/good/best comparisons.

### Database Schema (`lib/schema.ts`)

- `subscribers`: Email list with unsubscribe tokens, preferences, Stripe customer IDs
- `scenarios`: Generated interview content (JSON blob in `content` column)
- `emails`: Sent email log
- `subscriptions`: Stripe subscription tracking

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/cron/daily-challenge` | Daily scenario generation + email blast (protected by CRON_SECRET) |
| `/api/subscribe` | Newsletter signup |
| `/api/unsubscribe` | One-click unsubscribe |
| `/api/preferences` | Update user preferences |
| `/api/checkout` | Create Stripe checkout session |
| `/api/webhooks/stripe` | Stripe webhook handler |
| `/api/admin/tables` | Admin data access |

### Main Components

- `InterviewScenario.tsx`: Core scenario viewer with stepped framework reveal
- `DesignProblem.tsx`: Design problem presentation
- `NewsletterSignup.tsx`: Email capture form
- `PricingButton.tsx`: Stripe checkout integration

## Environment Variables

Required in `.env.local` (see `.env.example`):
- `OPENAI_API_KEY`: For scenario generation
- `RESEND_API_KEY`: For email delivery
- `CRON_SECRET`: Protects cron endpoint
- Stripe keys for payments (optional for basic functionality)

## Content Model

Each generated scenario follows this structure (defined in `lib/ai.ts`):
```
InterviewScenario {
  metadata: { difficulty, topics, estimated_time }
  problem: { title, statement, context, pause_prompt }
  framework_steps: [{
    step_name, time_allocation, description,
    comparison_table: { criterion, responses: [bad, good, best] },
    key_takeaways
  }]
  interview_simulation: { dialogue exchanges }
  summary, reflection_prompts
}
```

## Deployment

Deployed on Vercel. The `vercel.json` configures:
- Daily cron at `/api/cron/daily-challenge` (0 6 * * *)
- Extended function timeout (60s) for AI generation
