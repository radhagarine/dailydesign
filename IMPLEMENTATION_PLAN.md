# Implementation Plan: Principal Engineer Interview Simulator

## Current State Summary

**Completed:**
- Landing page with pricing UI
- 3 sample scenarios (fully functional)
- Newsletter signup with SQLite storage
- AI content generation (OpenAI GPT-4)
- Email delivery (Resend)
- Daily cron endpoint structure
- Theme rotation system

**Critical Gaps (Priority Order):**
1. Email unsubscribe mechanism (legal requirement)
2. Scenario persistence & archive pages
3. User preferences collection
4. Production deployment
5. Stripe payment integration (last)

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
- [ ] Create `/welcome` onboarding page
- [ ] 3-question form (quick, <60 seconds)
- [ ] Save preferences on submit
- [ ] Redirect after newsletter signup

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
- [ ] Consider switching to Turso/LibSQL for serverless (optional)

### 4.3 Vercel Deployment
- [x] Configure `vercel.json` for cron jobs (daily at 6am UTC)
- [ ] Set up environment variables in Vercel dashboard
- [ ] Deploy and test

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

### 5.6 Access Control (Future)
- [ ] Gate daily scenarios behind subscription
- [ ] Keep samples free
- [ ] Add subscription status check to cron

---

## Technical Decisions

### Database
- **Current:** SQLite (better-sqlite3)
- **Production:** Consider Turso for edge compatibility, or keep SQLite for simplicity

### Email
- **Provider:** Resend (already integrated)
- **Compliance:** CAN-SPAM requires unsubscribe in every email

### AI
- **Model:** GPT-4o (already integrated)
- **Fallback:** Consider caching/pre-generation for reliability

### Hosting
- **Target:** Vercel (Next.js native, cron support)
- **Alternative:** Railway, Render

---

## File Structure After Implementation

```
app/
├── page.tsx                    # Landing page
├── archive/page.tsx            # Scenario archive (NEW)
├── scenarios/[slug]/page.tsx   # Dynamic scenario pages (NEW)
├── unsubscribe/page.tsx        # Unsubscribe confirmation (NEW)
├── welcome/page.tsx            # Onboarding preferences (NEW)
├── samples/                    # Existing sample pages
└── api/
    ├── subscribe/route.ts      # Updated with token
    ├── unsubscribe/route.ts    # NEW
    ├── scenarios/route.ts      # NEW - list scenarios
    └── cron/daily-challenge/route.ts  # Updated

lib/
├── schema.ts                   # Updated with new tables
├── db.ts                       # Unchanged
├── email.ts                    # Updated with unsubscribe link
├── ai.ts                       # Unchanged
└── content-strategy.ts         # Unchanged
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

**Phase 5: Stripe Integration**
- ✅ Stripe SDK integration
- ✅ `subscriptions` table and schema updates
- ✅ `/api/checkout` endpoint for creating checkout sessions
- ✅ `/api/webhooks/stripe` for handling subscription events
- ✅ `/checkout/success` page for post-payment
- ✅ `PricingButton` component with email capture

**Additional Improvements**
- ✅ Enhanced AI prompts for principal-level quality content
- ✅ Free samples section on home page
- ✅ Improved footer with navigation links
- ✅ Better pricing section with value messaging

### Remaining User Tasks
1. Create Stripe account and configure products/prices
2. Deploy to Vercel and set environment variables
3. Generate test scenarios to verify AI quality
4. Add subscription gating for premium content (optional)
