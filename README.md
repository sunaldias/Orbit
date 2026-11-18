# ORBIT — Creative Agency & Event Visual Production Website

Production-ready website for **ORBIT**, a futuristic creative agency specializing in event-related creative services and digital visual production.

## Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend & Database**: Next.js Route Handlers (`POST /api/inquiries`), Supabase PostgreSQL with Row Level Security (RLS)
- **Email**: Resend (business inquiry notification + optional branded client confirmation receipt)
- **Media**: Cloudinary (`f_auto,q_auto` responsive image & video delivery) with curated local fallback visuals
- **Security**: Zod validation & sanitization, Cloudflare Turnstile server verification, Upstash Redis sliding-window rate limiting, strict CSP/HSTS headers, honeypot defense, salted IP hashing
- **Deployment**: Vercel + GitHub

## Quick Start (Local Development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment variable template:
   ```bash
   cp .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`. Curated showcase projects and local fallbacks work out of the box even before external keys are configured.

## Production Setup Checklist

### 1. Supabase PostgreSQL & RLS
1. Create a Supabase project and open the **SQL Editor**.
2. Execute [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql).
3. Execute [`supabase/migrations/0002_rls_policies.sql`](supabase/migrations/0002_rls_policies.sql).
4. Execute [`supabase/migrations/0003_dynamic_portfolio_categories.sql`](supabase/migrations/0003_dynamic_portfolio_categories.sql).
5. Execute [`supabase/migrations/0004_inquiry_dedup_and_reference_link.sql`](supabase/migrations/0004_inquiry_dedup_and_reference_link.sql).
6. Optionally execute [`supabase/seed.sql`](supabase/seed.sql) to populate the 11 canonical services.
7. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

### 2. Adding New Portfolio Projects (Zero Frontend Code Changes)
1. Upload your project thumbnail and image/video media to **Cloudinary** (or copy the `public_id` / `https://res.cloudinary.com/...` URL).
2. Insert a new row into `public.portfolio_projects` in Supabase Studio with:
   - `slug` (SEO-friendly URL, e.g. `eclipse-arena-tour`)
   - `title`, `summary`, `category` (`videography`, `photography`, `graphic-design`, `motion-graphics`, or `event-experiences`)
   - `thumbnail_url` & `media_url` (Cloudinary `public_id` or full Cloudinary URL)
   - `primary_media_type` (`image` or `video`), `aspect_ratio` (`landscape`, `portrait`, `square`, or `wide`), `event_date`, `is_featured`, and `status = 'published'`
3. The project automatically appears in `/portfolio`, `/api/portfolio`, `/sitemap.xml`, and its own dynamic SEO page at `/portfolio/<slug>`.
4. Optionally configure a Supabase Database Webhook pointing to `POST /api/portfolio/revalidate` with header `x-orbit-revalidate-secret: <PORTFOLIO_REVALIDATE_SECRET>` for instant cache updates.

### 3. Resend Business Email
1. Verify your agency domain in Resend.
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `INQUIRY_RECIPIENT_EMAIL`.
3. Keep `SEND_CLIENT_CONFIRMATION="true"` to also send clients an automated receipt with their booking reference code (`ORB-YYYY-XXXXXX`).

### 4. Cloudflare Turnstile & Upstash Redis
1. Create a Cloudflare Turnstile widget for your domain and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
2. Create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. Set a random 64-character `IP_HASH_SALT` (`openssl rand -hex 32`).

## Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Production build
- `npm run typecheck` — Strict TypeScript check (`tsc --noEmit`)
- `npm run lint` — ESLint check
- `npm test` — Run validation & security unit tests
