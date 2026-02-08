# Code Review Findings & Remediation Plan

**Date**: 2026-02-08
**Reviewer**: Claude Opus 4.6
**Scope**: Full codebase security, quality, performance, and testing review

---

## Critical Issues (Fix Before Next Deploy)

### 1. CRITICAL: Admin Tables Route Has No Authentication
- **File**: `app/api/admin/tables/route.ts`
- **Impact**: Full database exfiltration - subscriber emails, unsubscribe tokens, Stripe customer IDs
- **Fix**: Add Bearer token auth (CRON_SECRET) to both GET and POST handlers
- **Status**: FIXING NOW

### 2. CRITICAL: Unsubscribe Token Leaked in Subscribe Response
- **File**: `app/api/subscribe/route.ts:21-28`
- **Impact**: Any attacker can enumerate emails and obtain unsubscribe tokens to unsubscribe anyone
- **Fix**: Remove token from existing-subscriber response; keep for new subscribers (needed for welcome flow)
- **Status**: FIXING NOW

### 3. CRITICAL: Unbounded Concurrent Email Sending
- **File**: `app/api/cron/daily-challenge/route.ts:106-117`
- **Impact**: `Promise.all()` fires all emails simultaneously, hitting Resend rate limits (10 req/sec free tier)
- **Fix**: Batch emails in groups of 10 with 1-second delays between batches
- **Status**: FIXING NOW

---

## High Severity Issues

| # | File | Issue |
|---|------|-------|
| 4 | `app/api/admin/tables/route.ts:115` | Raw SQL execution with bypassable SELECT-only check |
| 5 | All API routes | No rate limiting on any endpoint |
| 6 | `app/api/unsubscribe/route.ts` | GET for state-changing operation - email scanners auto-unsubscribe users |
| 7 | Project root | No `middleware.ts` for centralized security headers or auth |
| 8 | `components/ArchitectureDiagram.tsx:39` | `innerHTML = svg` without DOMPurify (XSS risk) |
| 9 | Project-wide | Zero test coverage - no test files or framework |

---

## Medium Severity Issues

| # | File | Issue |
|---|------|-------|
| 10 | `app/api/cron/daily-challenge/route.ts:150-262` | Email HTML interpolates AI content without escaping |
| 11 | `app/api/subscribe/route.ts:10` | Email validation is just `!email.includes('@')` |
| 12 | `app/api/webhooks/stripe/route.ts` | No idempotency check on webhook events |
| 13 | `app/scenarios/[slug]/page.tsx` | Same DB query runs twice (generateMetadata + page) - use React `cache()` |
| 14 | `app/archive/page.tsx:52-57` | `SELECT *` fetches full JSON content column; only needs slug/title/date |
| 15 | `app/scenarios/[slug]/page.tsx`, `app/archive/page.tsx` | No `revalidate` export - every request hits DB |
| 16 | `lib/ai.ts:316-341` | No retry logic for OpenAI API calls |
| 17 | `lib/content-strategy.ts:56-57` | `Math.random()` for Sunday problem type - non-deterministic |
| 18 | `lib/ai.ts:12-174` | Zod schemas and TS interfaces manually synced; use `z.infer<>` |
| 19 | `components/InterviewScenario.tsx:646-661` | Scroll handler without throttling/rAF |
| 20 | `app/page.tsx:1` | Entire landing page is `'use client'` - kills SSR |
| 21 | `package.json` | `mermaid` (~2-3MB) large bundle impact |

---

## Low Severity Issues

| # | File | Issue |
|---|------|-------|
| 22 | Multiple files | Duplicated code: `MarkdownContent`, `getBaseUrl()`, `getThemeLabel()` |
| 23 | `app/page.tsx:286` | `**No.**` Markdown syntax in HTML `<p>` tag - renders as literal text |
| 24 | `app/page.tsx:339` | Placeholder `support@example.com` and `#` links in footer |
| 25 | `lib/schema.ts:68` | No FK constraint on `subscriptions.subscriberId` |
| 26 | `components/InterviewScenario.tsx:626` | `new Set(Array.from(prev))` - `Array.from` unnecessary |
| 27 | Multiple error handlers | `details: String(error)` leaks internals in responses |
| 28 | `next.config.js` | No security headers configured |
| 29 | Cron routes | Timing attack on `!==` secret comparison |
| 30 | `app/api/unsubscribe/route.ts` | Email address leaked in unsubscribe response |

---

## Positive Findings

- Stripe webhook signature verification is correct
- Drizzle ORM queries are parameterized (no SQL injection in standard routes)
- Unsubscribe token generation uses `crypto.randomBytes(32)` (256 bits entropy)
- CRON_SECRET protection on cron and pre-generate routes
- No `NEXT_PUBLIC_` prefix on sensitive server-side keys
- `.gitignore` properly excludes `.env*.local`

---

## Priority Remediation Schedule

**Immediate (this session):**
1. Add auth to `/api/admin/tables`
2. Stop leaking unsubscribe tokens in subscribe response
3. Add email sending batching

**Short-term (next sprint):**
4. Create `middleware.ts` with security headers + admin auth
5. Change unsubscribe to two-step flow (GET confirm page, POST executes)
6. Set up Vitest + write tests for `content-strategy.ts` and API routes
7. Add React `cache()` + ISR `revalidate` exports
8. Use `z.infer<>` instead of duplicate interfaces

**Medium-term:**
9. Add rate limiting (Upstash)
10. Add DOMPurify for Mermaid SVG
11. HTML-escape AI content in email templates
12. Add OpenAI retry logic
13. Convert landing page to server component
14. Audit/remove unused dependencies
