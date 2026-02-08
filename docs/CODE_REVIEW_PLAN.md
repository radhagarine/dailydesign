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

| # | File | Issue | Status |
|---|------|-------|--------|
| 4 | `app/api/admin/tables/route.ts:115` | Raw SQL execution with bypassable SELECT-only check | FIXED - POST handler removed entirely |
| 5 | All API routes | No rate limiting on any endpoint | FIXED - In-memory rate limiter in `middleware.ts` |
| 6 | `app/api/unsubscribe/route.ts` | GET for state-changing operation - email scanners auto-unsubscribe users | FIXED - GET is read-only; POST does unsubscribe; page shows confirmation |
| 7 | Project root | No `middleware.ts` for centralized security headers or auth | FIXED - `middleware.ts` with security headers (HSTS, X-Frame-Options, CSP, etc.) |
| 8 | `components/ArchitectureDiagram.tsx:39` | `innerHTML = svg` without DOMPurify (XSS risk) | FIXED - SVG sanitized with DOMPurify |
| 9 | Project-wide | Zero test coverage - no test files or framework | TODO |

---

## Medium Severity Issues

| # | File | Issue | Status |
|---|------|-------|--------|
| 10 | `app/api/cron/daily-challenge/route.ts:150-262` | Email HTML interpolates AI content without escaping | FIXED - `escapeHtml()` applied to all AI content |
| 11 | `app/api/subscribe/route.ts:10` | Email validation is just `!email.includes('@')` | FIXED - Proper regex + length check |
| 12 | `app/api/webhooks/stripe/route.ts` | No idempotency check on webhook events | FIXED - In-memory event ID dedup |
| 13 | `app/scenarios/[slug]/page.tsx` | Same DB query runs twice (generateMetadata + page) - use React `cache()` | FIXED - `cache()` wrapping `getScenario()` |
| 14 | `app/archive/page.tsx:52-57` | `SELECT *` fetches full JSON content column; only needs slug/title/date | FIXED - Uses `json_extract()` for summary, no full content fetch |
| 15 | `app/scenarios/[slug]/page.tsx`, `app/archive/page.tsx` | No `revalidate` export - every request hits DB | FIXED - `revalidate = 3600` on both pages |
| 16 | `lib/ai.ts:316-341` | No retry logic for OpenAI API calls | FIXED - 3 retries with exponential backoff for transient errors |
| 17 | `lib/content-strategy.ts:56-57` | `Math.random()` for Sunday problem type - non-deterministic | FIXED - Uses `weekIndex % 2` for deterministic alternation |
| 18 | `lib/ai.ts:12-174` | Zod schemas and TS interfaces manually synced; use `z.infer<>` | FIXED - Types derived via `z.infer<>` |
| 19 | `components/InterviewScenario.tsx:646-661` | Scroll handler without throttling/rAF | FIXED - `requestAnimationFrame` throttling + passive listener |
| 20 | `app/page.tsx:1` | Entire landing page is `'use client'` - kills SSR | FIXED - Removed `'use client'`, now server component (saved ~5KB) |
| 21 | `package.json` | `mermaid` (~2-3MB) large bundle impact | MITIGATED - Already uses dynamic `import()`, code-split from main bundle |

---

## Low Severity Issues

| # | File | Issue | Status |
|---|------|-------|--------|
| 22 | Multiple files | Duplicated code: `MarkdownContent`, `getBaseUrl()`, `getThemeLabel()` | FIXED - Extracted to `components/MarkdownContent.tsx`, `lib/utils.ts` |
| 23 | `app/page.tsx:286` | `**No.**` Markdown syntax in HTML `<p>` tag - renders as literal text | FIXED - Replaced with `<strong>No.</strong>` |
| 24 | `app/page.tsx:339` | Placeholder `support@example.com` and `#` links in footer | FIXED - Real email, proper `<Link>` routes |
| 25 | `lib/schema.ts:68` | No FK constraint on `subscriptions.subscriberId` | FIXED - `.references(() => subscribers.id)` |
| 26 | `components/InterviewScenario.tsx:626` | `new Set(Array.from(prev))` - `Array.from` unnecessary | FIXED - `new Set(prev)` |
| 27 | Multiple error handlers | `details: String(error)` leaks internals in responses | FIXED - Removed `details` from error responses |
| 28 | `next.config.js` | No security headers configured | FIXED - Security headers in `next.config.js` headers() |
| 29 | Cron routes | Timing attack on `!==` secret comparison | FIXED - `lib/auth.ts` with `crypto.timingSafeEqual()` |
| 30 | `app/api/unsubscribe/route.ts` | Email address leaked in unsubscribe response | FIXED - Already fixed in High Severity pass |

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
