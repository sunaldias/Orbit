# ORBIT Website — Security Architecture & Verification

This document describes the security controls implemented across the **ORBIT** web application and the verification tests run against the production build.

---

## 1. Threat Model & Scope

ORBIT is a public creative agency website with a dynamic portfolio and a public booking inquiry endpoint (`POST /api/inquiries`). By design:
- **No online payments** are processed.
- **No public user authentication** or session cookies are created.
- The primary attack surfaces are public API endpoints (`/api/inquiries`, `/api/portfolio`, `/api/portfolio/revalidate`), client-side injection (XSS), CSRF/origin spoofing, automated spam/DoS, database misconfiguration, and secret leakage.

---

## 2. Implemented Security Controls

### 2.1 Strict Server-Side Input Validation (Zod)
- Shared schemas in [`src/schemas/inquiry.ts`](src/schemas/inquiry.ts) and [`src/schemas/portfolio.ts`](src/schemas/portfolio.ts) run on the client for UX and are enforced authoritatively on the server (`zod@^4.6.7`).
- Single-line inputs strip ASCII control characters and `\r\n` (CRLF) to prevent email header injection and log forging.
- `referenceLink` strictly allows only `http:` and `https:` URLs, blocking `javascript:` and `data:` XSS schemes.
- Service slugs and budget ranges are strictly allowlisted.
- Prototype-pollution keys (`__proto__`, `constructor`, `prototype`) are detected and rejected before validation ([`src/lib/security.ts`](src/lib/security.ts)).

### 2.2 Secure Database Access & Supabase RLS
- Row Level Security (RLS) is enabled on **all 5 PostgreSQL tables** (`services`, `portfolio_projects`, `project_media`, `project_services`, `inquiries`) in [`supabase/migrations/0002_rls_policies.sql`](supabase/migrations/0002_rls_policies.sql) and hardened further in [`supabase/migrations/0005_security_hardening_rls.sql`](supabase/migrations/0005_security_hardening_rls.sql).
- `public.inquiries` has `FORCE ROW LEVEL SECURITY`, explicit `REVOKE ALL FROM public, anon, authenticated`, and **zero** policies for public roles. Neither reads nor writes are permitted via the public anon key.
- All inquiry inserts and status updates run exclusively inside server-only API routes using `SUPABASE_SERVICE_ROLE_KEY` ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts)).
- Public read-only tables allow `SELECT` strictly on `status = 'published'` / `is_active = true`.

### 2.3 Secure API Endpoints & Request Body Size Limits
- Streaming chunk-by-chunk body reader (`readBoundedJsonBody` in [`src/lib/security.ts`](src/lib/security.ts)) enforces hard caps before buffering in memory:
  - `POST /api/inquiries`: **16 KB** hard limit (`413 Payload Too Large`)
  - `POST /api/portfolio/revalidate`: **4 KB** hard limit (`413 Payload Too Large`)
- Enforces `Content-Type: application/json` (`415 Unsupported Media Type`) and `Cache-Control: no-store, max-age=0` on mutating endpoints.
- Unexported HTTP methods automatically return `405 Method Not Allowed`.
- Revalidation webhook (`POST /api/portfolio/revalidate`) validates `x-orbit-revalidate-secret` using constant-time SHA-256 + `crypto.timingSafeEqual`.

### 2.4 Rate Limiting & Duplicate Prevention
- Distributed sliding-window rate limiting powered by **Upstash Redis** ([`src/lib/rate-limit.ts`](src/lib/rate-limit.ts)) with graceful in-memory resilience fallback:
  - `POST /api/inquiries`: **5 requests / 15 min per salted IP hash** + **5 requests / 1 hour per normalized email** (`429 Too Many Requests` with `Retry-After`).
  - `GET /api/portfolio`: **60 requests / 1 min per salted IP hash**.
  - `POST /api/portfolio/revalidate`: **20 requests / 15 min per salted IP hash**.
- Multi-layer duplicate submission prevention combines client-side `idempotencyKey`, atomic 15-minute Redis `NX` locks on both `idempotencyKey` and salted content fingerprint, and Supabase database uniqueness/lookback checks (`409 Conflict`).

### 2.5 Cloudflare Turnstile Bot Verification
- Client widget ([`src/components/inquiry/TurnstileWidget.tsx`](src/components/inquiry/TurnstileWidget.tsx)) pairs with strict server-side verification against `https://challenges.cloudflare.com/turnstile/v0/siteverify` ([`src/lib/turnstile.ts`](src/lib/turnstile.ts)) with a 5-second timeout, `remoteip` forwarding, production hostname check, and fail-closed production enforcement.
- Backed by a silent hidden honeypot field.

### 2.6 XSS, CSRF & Origin Protections
- **XSS**: React automatic escaping across UI, strict HTML escaping (`escapeHtml`) on every field in email templates, strict `http:`/`https:` URL validation on `referenceLink`, and `serializeJsonLd()` escaping `<`, `>`, `&`, `\u2028`, `\u2029` in every `<script type="application/ld+json">` tag to prevent `</script>` breakout XSS.
- **CSRF / Origin**: `isAllowedOrigin()` rejects `Sec-Fetch-Site: cross-site` and verifies `Origin` (with `Referer` fallback) against `Host` and `NEXT_PUBLIC_SITE_URL` (`403 Forbidden`).

### 2.7 Security Response Headers
Configured globally in [`next.config.ts`](next.config.ts) (`poweredByHeader: false`):
- `Content-Security-Policy` (allowlists `'self'`, `res.cloudinary.com`, and `challenges.cloudflare.com`; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-DNS-Prefetch-Control: off`
- `X-Permitted-Cross-Domain-Policies: none`

### 2.8 Secrets Management, Safe Errors & PII-Free Logging
- Server-only isolation (`import "server-only"`) enforced on [`src/lib/env.ts`](src/lib/env.ts), [`src/lib/logger.ts`](src/lib/logger.ts), [`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts), [`src/lib/supabase/public.ts`](src/lib/supabase/public.ts), [`src/lib/resend.ts`](src/lib/resend.ts), [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts), and [`src/lib/turnstile.ts`](src/lib/turnstile.ts).
- Privileged secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SALT`, `PORTFOLIO_REVALIDATE_SECRET`) never use the `NEXT_PUBLIC_` prefix and are verified absent from compiled `.next/static/` browser bundles.
- Structured allowlisted logger ([`src/lib/logger.ts`](src/lib/logger.ts)) records only event names, routes, HTTP status codes, reference codes, and 10-char truncated salted IP hashes—never names, emails, phone numbers, project briefs, raw IPs, or tokens.
- Client error responses return generic safe messages without stack traces or internal SQL/provider details.

### 2.9 Secure Email Handling
- Business notifications and customer acknowledgment emails are built in [`src/emails/inquiry-templates.ts`](src/emails/inquiry-templates.ts) with 100% HTML-escaped fields, CRLF-stripped headers, and explicit non-binding inquiry disclaimers (submitting an inquiry does not automatically confirm a booking).

---

## 3. Verification Results

| Verification Check | Result |
| :--- | :--- |
| TypeScript strict check (`npm run typecheck`) | Passed (0 errors) |
| ESLint (`npm run lint`) | Passed (0 warnings/errors) |
| Unit security & schema tests (`npm test`) | Passed (20/20 tests) |
| Compiled browser bundle secret scan (`.next/static/`) | Passed (0 secrets found) |
| Live HTTP security smoke suite (12 checks against production server) | Passed (12/12: headers, CSRF 403, `Sec-Fetch-Site` 403, `415`, `413` size cap, prototype pollution `400`, `javascript:` URL `400`, Turnstile fail-closed `400`, IP rate limit `429` + `Retry-After`, portfolio SQLi query `400`, webhook auth `401`/`503`, `405`) |

---

## 4. Dependency Vulnerability Status (`npm audit`)

- **Remediated**: Upgraded `zod` to `^4.6.7`, eliminating high-severity advisory `GHSA-mrhx-c7xc-m3w5`.
- **Known Residual Advisories (Tracked)**:
  - `postcss <=8.5.22` (transitive inside `next@15.5.29`, build-time CSS compilation only; no user-supplied CSS is ever processed at runtime; fix requires major upgrade to `next@16.4.6+`).
  - `picomatch` (dev-only transitive dependency inside `eslint-config-next`, not shipped in production runtime).
- Run `npm run security:audit` in CI before each deployment.

---

## 5. Production Deployment Security Checklist

Before going live on Vercel:
1. Run all 5 SQL migrations (`0001` through `0005`) in Supabase SQL Editor and verify `inquiries` cannot be queried with the `anon` key.
2. Configure all secret environment variables in Vercel (Production & Preview) and set a strong 64-char random `IP_HASH_SALT`.
3. Configure Cloudflare Turnstile keys for your production domain and verify the widget challenges real submissions.
4. Connect Upstash Redis for distributed multi-region rate limiting and deduplication.
5. Verify your Resend sending domain (SPF, DKIM, DMARC) and set `INQUIRY_RECIPIENT_EMAIL` to ORBIT's production inbox.
