# Implementation Plan: Principal Engineer Interview Simulator

## Current State Summary

**Completed:**
- Landing page with pricing UI
- 3 sample scenarios (fully functional)
- Newsletter signup with Turso (libsql) storage
- AI content generation (OpenAI GPT-4o-mini + Zod Structured Outputs)
- Email delivery (Resend)
- Daily cron endpoint with pre-generation support
- Theme rotation system (4 themes, weekly rotation)
- Email unsubscribe mechanism (token-based)
- Scenario persistence & archive pages
- User preferences collection & onboarding
- Stripe payment integration (checkout, webhooks, subscriptions)
- Legal pages (Terms of Service, Privacy Policy)
- Content gating (token-based access via email links)
- Pre-generation system (weekly cron + admin endpoint)

**Remaining User Tasks:**
1. Create Stripe account and configure products/prices
2. Deploy to Vercel and set environment variables
3. Generate test scenarios to verify AI quality

---

## Phase 1: Email Compliance & Unsubscribe (Priority: CRITICAL)

### 1.1 Database Schema Update
- [x] Add `unsubscribeToken` to subscribers table
- [x] Add unique token generation on signup

### 1.2 Unsubscribe API Endpoint
- [x] Create `/api/unsubscribe` endpoint
- [x] Validate token and update subscriber status
- [x] Return confirmation page

### 1.3 Unsubscribe Page
- [x] Create `/unsubscribe` page with confirmation UI
- [x] Handle success/error states

### 1.4 Email Template Update
- [x] Add unsubscribe link to all emails
- [x] Include subscriber-specific token in link

---

## Phase 2: Scenario Persistence & Archive (Priority: HIGH)

### 2.1 Database Schema
- [x] Create `scenarios` table (id, slug, title, content JSON, generatedAt, theme, problemType)
- [x] Add index on slug for fast lookups

### 2.2 Scenario Storage
- [x] Save generated scenarios to DB in cron job
- [x] Generate unique slugs (date-based: `2024-01-15-distributed-rate-limiter`)

### 2.3 Dynamic Scenario Pages
- [x] Create `/scenarios/[slug]` dynamic route
- [x] Render scenario using existing DesignProblem component
- [x] Add navigation between scenarios

### 2.4 Archive Page
- [x] Create `/archive` page listing all past scenarios
- [x] Show title, date, theme, problem type
- [x] Pagination for large lists

### 2.5 Update Email Links
- [x] Link to persisted scenario page instead of inline content
- [x] Keep inline content as fallback

---

## Phase 3: User Preferences (Priority: MEDIUM)

### 3.1 Database Schema
- [x] Add preferences columns to subscribers table:
  - `yearsExperience`: '8-12' | '12-16' | '16-20' | '20+'
  - `primaryRole`: 'backend' | 'fullstack' | 'infrastructure'
  - `prepStage`: 'starting' | 'active' | 'scheduled'
  - `timezone`: string (for delivery time)

### 3.2 Preferences Collection
- [x] Create `/welcome` onboarding page
- [x] 3-question form (quick, <60 seconds)
- [x] Save preferences on submit
- [x] Redirect after newsletter signup

### 3.3 Personalization (Light)
- [ ] Use preferences to adjust "Best Answer" scaffolding level
- [ ] Future: Filter scenarios by domain preference

---

## Phase 4: Production Deployment (Priority: MEDIUM)

### 4.1 Environment Setup
- [x] Create `.env.example` with required variables
- [x] Document deployment requirements

### 4.2 Database Migration
- [x] Add migration script to package.json (db:generate, db:push)
- [x] Migrated to Turso/LibSQL for serverless (using `@libsql/client` + `drizzle-orm/libsql`)

### 4.3 Vercel Deployment
- [x] Configure `vercel.json` for cron jobs (daily at 6am UTC)
- [ ] Set up environment variables in Vercel dashboard (user task)
- [ ] Deploy and test (user task)

### 4.4 Monitoring
- [ ] Add basic error logging
- [ ] Set up Vercel analytics

---

## Phase 5: Stripe Payment Integration (Priority: LAST)

### 5.1 Stripe Setup
- [x] Add Stripe SDK dependency
- [x] Create `lib/stripe.ts` utility with configuration
- [ ] Create Stripe account and get API keys (user task)
- [ ] Define products: Monthly ($20), Annual ($180) in Stripe dashboard (user task)

### 5.2 Database Schema
- [x] Add `subscriptions` table with full subscription tracking
- [x] Add `stripeCustomerId` to subscribers table

### 5.3 Checkout Flow
- [x] Create `/api/checkout` endpoint
- [x] Integrate Stripe Checkout Sessions
- [x] Create `/checkout/success` page for post-payment

### 5.4 Webhook Handler
- [x] Create `/api/webhooks/stripe` endpoint
- [x] Handle subscription events (created, updated, deleted)
- [x] Handle payment failure events
- [x] Update user subscription status

### 5.5 UI Integration
- [x] Create `PricingButton` component with email capture
- [x] Update home page pricing section with functional buttons

### 5.6 Access Control
- [x] Gate daily scenarios behind token-based access (via email links)
- [x] Keep samples free (no gating on `/samples/*`)
- [ ] Add subscription status check to cron (only email paying subscribers)

---

## Technical Decisions

### Database
- **Current:** Turso (libsql) with `@libsql/client` driver + Drizzle ORM
- **Dialect:** `turso` in Drizzle config
- **Connection:** `createClient({ url, authToken })` from `@libsql/client`

### Email
- **Provider:** Resend (integrated)
- **Compliance:** CAN-SPAM compliant — unsubscribe in every email

### AI
- **Model:** GPT-4o-mini with Zod Structured Outputs (`zodResponseFormat`)
- **Pre-generation:** Weekly cron pre-generates 7 days of content (Sunday 3 AM UTC)
- **Fallback:** On-the-fly generation if no pre-generated scenario available

### Hosting
- **Target:** Vercel (Next.js native, cron support)
- **Alternative:** Railway, Render

### Content Gating
- **Method:** Token-based via email links (`?token=unsubscribeToken`)
- **Reuses:** Existing `unsubscribeToken` from subscribers table (no new column needed)
- **Free content:** Sample scenarios at `/samples/*` remain ungated
- **Paywall:** `ScenarioTeaser` component shows problem + context, locks analysis

---

## File Structure

```
app/
├── page.tsx                        # Landing page
├── archive/page.tsx                # Scenario archive
├── scenarios/[slug]/page.tsx       # Dynamic scenario pages (gated)
├── unsubscribe/page.tsx            # Unsubscribe confirmation
├── welcome/page.tsx                # Onboarding preferences
├── terms/page.tsx                  # Terms of Service
├── privacy/page.tsx                # Privacy Policy
├── checkout/success/page.tsx       # Post-payment success
├── samples/                        # Free sample pages (ungated)
├── admin/tables/route.ts           # Admin data access
└── api/
    ├── subscribe/route.ts          # Newsletter signup
    ├── unsubscribe/route.ts        # Unsubscribe handler
    ├── preferences/route.ts        # User preferences
    ├── checkout/route.ts           # Stripe checkout
    ├── webhooks/stripe/route.ts    # Stripe webhooks
    ├── admin/pre-generate/route.ts # Admin pre-generation
    └── cron/
        ├── daily-challenge/route.ts    # Daily scenario + email
        └── pre-generate-weekly/route.ts # Weekly pre-generation

lib/
├── schema.ts                   # DB schema (subscribers, scenarios, emails, subscriptions)
├── db.ts                       # Turso/Drizzle connection
├── access.ts                   # Token-based access validation
├── ai.ts                       # OpenAI scenario generation
├── auth.ts                     # Bearer token verification
├── email.ts                    # Resend email delivery
├── stripe.ts                   # Stripe configuration
├── content-strategy.ts         # Theme/problem type rotation
└── utils.ts                    # Shared utilities

components/
├── InterviewScenario.tsx       # Full scenario viewer (gated content)
├── ScenarioTeaser.tsx          # Paywall teaser (ungated preview)
├── Badge.tsx                   # Reusable badge component
├── DesignProblem.tsx           # Design problem display
├── MarkdownContent.tsx         # Markdown renderer
├── NewsletterSignup.tsx        # Email capture form
└── PricingButton.tsx           # Stripe checkout integration
```

---

## Progress Summary

### Completed (All Phases)

**Phase 1: Email Compliance**
- ✅ Email unsubscribe mechanism with token-based authentication
- ✅ Unsubscribe page with multiple states (success, already, invalid, error)
- ✅ Updated cron job to include unsubscribe links

**Phase 2: Scenario Persistence**
- ✅ Scenarios table for persistence with slug-based URLs
- ✅ Dynamic `/scenarios/[slug]` page with DynamicScenario component
- ✅ Archive page listing all past scenarios
- ✅ Improved email template with proper styling and CTA buttons

**Phase 3: User Preferences**
- ✅ Database schema updated with preferences columns
- ✅ `/welcome` onboarding page with 3-question form
- ✅ `/welcome/complete` success page
- ✅ `/api/preferences` endpoint to save preferences
- ✅ Updated subscribe flow to redirect to onboarding

**Phase 4: Production Deployment**
- ✅ `.env.example` with documented variables
- ✅ `vercel.json` for cron job configuration
- ✅ Database migration scripts in package.json
- ✅ Migrated to Turso (libsql) for serverless compatibility

**Phase 5: Stripe Integration**
- ✅ Stripe SDK integration
- ✅ `subscriptions` table and schema updates
- ✅ `/api/checkout` endpoint for creating checkout sessions
- ✅ `/api/webhooks/stripe` for handling subscription events
- ✅ `/checkout/success` page for post-payment
- ✅ `PricingButton` component with email capture
- ✅ Token-based content gating (scenarios locked without valid token)

**Phase 6: Template.md Integration**
- ✅ Enhanced AI prompt with Zod Structured Outputs
- ✅ InterviewScenario component with progressive reveal
- ✅ Pre-generation system (weekly cron + admin endpoint)

**Phase 7: Legal Pages**
- ✅ `/terms` — Terms of Service (subscription terms, 7-day refund, educational disclaimer)
- ✅ `/privacy` — Privacy Policy (email usage, no data selling, Stripe/Resend/Vercel/Turso disclosures)

**Phase 8: Content Gating**
- ✅ `lib/access.ts` — Token-based access validation
- ✅ `ScenarioTeaser` component — Paywall with problem preview + subscribe CTA
- ✅ Scenario page gating — Full content requires valid subscriber token
- ✅ Personalized email links — Each subscriber gets unique `?token=` in scenario URLs
- ✅ Samples remain free — `/samples/*` routes ungated

**Additional Improvements**
- ✅ Enhanced AI prompts for principal-level quality content
- ✅ Free samples section on home page
- ✅ Improved footer with navigation links
- ✅ Better pricing section with value messaging
- ✅ Security audit (authentication, token leaks, rate limiting)

### Remaining User Tasks
1. Create Stripe account and configure products/prices
2. Deploy to Vercel and set environment variables
3. Generate test scenarios to verify AI quality

---

## Phase 6: Template.md Integration (Completed)

### 6.1 Enhanced AI Prompt (lib/ai.ts)
- [x] Replaced simple prompts with comprehensive template.md-based prompt
- [x] Added TypeScript interfaces for new JSON schema:
  - `InterviewScenario` - main scenario structure
  - `FrameworkStep` - individual interview steps with comparison tables
  - `ComparisonTable` - bad/good/best response comparisons
  - `ComponentDecision` - architecture component decisions
- [x] Increased `max_tokens` to 8000 for comprehensive content
- [x] Enhanced validation with `validateScenarioStructure()`

### 6.2 Simplified Database Schema (lib/schema.ts)
- [x] Simplified scenarios table with single `content` JSON column
- [x] Removed legacy columns (answers, keyTakeaways, context, question, etc.)
- [x] Clean schema: `slug`, `title`, `content`, `theme`, `problemType`, `focusArea`, `generatedAt`

### 6.3 InterviewScenario Component (components/InterviewScenario.tsx)
- [x] Created comprehensive component for rendering full interview simulations
- [x] Features:
  - Progressive reveal: steps unlock one-by-one with "Reveal Analysis" buttons
  - Comparison tables: bad/good/best responses with color-coded styling
  - Calculations breakdown: storage, throughput, bandwidth metrics
  - Architecture diagrams: text-based architecture descriptions
  - Component decisions: individual technology choice comparisons
  - Interview simulation: dynamic requirements adaptation section
  - Summary & reflection: concepts, patterns, self-assessment prompts
- [x] Progress bar showing completion status
- [x] Time estimates per step

### 6.4 Cron Job Updates (app/api/cron/daily-challenge/route.ts)
- [x] Updated to generate comprehensive scenarios
- [x] Stores full scenario as single `content` JSON
- [x] Increased `maxDuration` to 120 seconds for longer generation
- [x] Enhanced email template with:
  - Framework steps preview
  - Topics tags
  - Response level previews

### 6.5 Simplified Pages
- [x] `/scenarios/[slug]/page.tsx` - Uses InterviewScenario component only
- [x] `/archive/page.tsx` - Extracts summary from content JSON

### New JSON Structure
The content format follows this structure:
```json
{
  "metadata": { "difficulty", "estimated_time_minutes", "topics", "generated_date" },
  "problem": { "title", "statement", "context", "pause_prompt" },
  "framework_steps": [
    {
      "step_number", "step_name", "time_allocation", "description",
      "comparison_table": { "criterion", "responses": [bad, good, best] },
      "interviewer_response": { "clarifications", "additional_context" },
      "calculations_breakdown": { "storage", "throughput", "bandwidth" },
      "key_takeaways": []
    }
  ],
  "interview_simulation": {
    "title", "description",
    "scenario": { "interviewer_question", "comparison_table" },
    "key_takeaways": []
  },
  "summary": { "critical_concepts_covered", "patterns_demonstrated", "what_made_responses_best_level" },
  "reflection_prompts": { "self_assessment", "practice_next" }
}
```

---

## Phase 7: Legal Pages (Completed)

### 7.1 Terms of Service (`app/terms/page.tsx`)
- [x] Server component with SEO metadata
- [x] Dark theme matching site design (`bg-dark-900`, maroon accents)
- [x] Covers: subscription terms, 7-day refund, cancellation policy
- [x] Educational content disclaimer (fictional scenarios, no interview guarantee)
- [x] Intellectual property and acceptable use sections
- [x] Contact information

### 7.2 Privacy Policy (`app/privacy/page.tsx`)
- [x] Server component with SEO metadata
- [x] Dark theme matching site design
- [x] Covers: email usage, no data selling
- [x] Third-party disclosures: Stripe, Resend, Vercel, Turso, OpenAI
- [x] Cookie policy (minimal cookies, no tracking)
- [x] Data retention periods (active, unsubscribed, email logs)
- [x] User rights (unsubscribe, data deletion, data access)

---

## Phase 8: Content Gating (Completed)

### 8.1 Access Validation (`lib/access.ts`)
- [x] `validateScenarioAccess(token)` function
- [x] Looks up subscriber by `unsubscribeToken`
- [x] Checks `status === 'active'`
- [x] Returns `{ valid, subscriber }` for page to use

### 8.2 Scenario Teaser (`components/ScenarioTeaser.tsx`)
- [x] Shows problem title, metadata (difficulty, topics, estimated time)
- [x] Displays full scenario context and interview question
- [x] Blurred placeholder for locked content
- [x] Lock icon + subscribe CTA overlay
- [x] "Already subscribed? Check your email" help text
- [x] Uses existing Badge component for topic tags

### 8.3 Scenario Page Gating (`app/scenarios/[slug]/page.tsx`)
- [x] Reads `token` from `searchParams`
- [x] Validates token via `validateScenarioAccess()`
- [x] Valid token → full `InterviewScenario` component
- [x] No/invalid token → `ScenarioTeaser` paywall

### 8.4 Personalized Email Links (`app/api/cron/daily-challenge/route.ts`)
- [x] Scenario URL now per-subscriber: `/scenarios/[slug]?token=[unsubscribeToken]`
- [x] Reuses existing `unsubscribeToken` (no new DB column needed)
- [x] Each subscriber gets a unique link in their email

---

### Benefits of New Format
1. **Structured Learning**: Step-by-step interview framework mirrors real interviews
2. **Deeper Calibration**: Comparison tables at each step (not just overall)
3. **Quantitative Focus**: Calculations breakdown with specific metrics
4. **Adaptability Training**: Dynamic requirements section teaches flexibility
5. **Self-Assessment**: Reflection prompts encourage active learning
6. **Progressive Disclosure**: Users think before seeing answers at each step
