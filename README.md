# Epsilon Labs Portfolio

A responsive portfolio site for Epsilon Labs, an AI and data consultancy helping growing businesses turn connected data into practical AI systems.

React 19 + Vite frontend, with a Supabase Postgres migration and a public Edge Function for contact enquiries in the same repository. The pale-gray and forest-green editorial design has no pictures, gradients, external font requests, or trackers. A one-time headline entrance and short interaction transitions respect reduced motion and keep keyboard navigation immediate.

**Current setup: placeholders only.** No Supabase project has been created or deployed. The site runs without credentials and prepares email drafts until you connect the backend below. Services and portfolio content remain editable in `src/content.js`; Supabase stores contact enquiries, not portfolio content.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Verify

```bash
npm test
npm run build
```

Tests cover HTTP validation, origin checks, error handling, browser configuration, and the actual SQL migration using an in-memory Postgres runtime (PGlite). They check anonymous/authenticated access denial, duplicate retries, constraints, and rate limits. GitHub Actions runs these checks on pushes and pull requests. This does not replace testing the deployed Supabase gateway after you connect a project.

## Contact form and Supabase

Without configuration, the form validates the visitor’s details and prepares an email draft addressed to `info.epsilondev@gmail.com`. The visitor must open their email app and send it. The site does not claim delivery, and nothing is transmitted by the Prepare enquiry button. A copy option and selectable draft provide a fallback when no email app is configured.

Confirm the real inbox before launch. Configure `VITE_CONTACT_EMAIL` in `.env.local` to change it, then rebuild. `.env.example` lists the supported settings.

When configured, React posts to the `contact-enquiry` Edge Function. The function validates the request, applies persistent limits, and saves it to `public.contact_enquiries`. The form confirms receipt only after storage succeeds. The backend does **not** send notification emails; review enquiries in your Supabase Dashboard's Table Editor and set their status to `new`, `in_progress`, or `closed`.

### Fill in later: hosted setup

1. Create a Supabase project in your own account. Note its project reference and URL.
2. Log in and link this repository using the included CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push --dry-run
   npx supabase db push
   ```

   Use a new project, or review the migration carefully before applying it to an existing database. The migration creates two tables and one function; it does not replace existing data.

3. Copy `supabase/functions/.env.example` to `supabase/functions/.env.local`. Set `CONTACT_ALLOWED_ORIGINS` to the exact origins of your deployed website (for example `https://your-domain.com`, with no trailing slash). Generate a salt with `openssl rand -hex 32` and put it in `CONTACT_RATE_LIMIT_SALT`. This file is gitignored. Do not share it or use a `VITE_` prefix for secrets.
4. Deploy the server settings and function:

   ```bash
   npx supabase secrets set --env-file supabase/functions/.env.local
   npx supabase functions deploy contact-enquiry
   ```

   Supabase injects `SUPABASE_URL` and the legacy `SUPABASE_SERVICE_ROLE_KEY` into the function runtime. This implementation uses the server-only service-role key for its internal PostgREST request. No database key is placed in the browser. The function intentionally has `verify_jwt = false` because visitors do not need accounts.

5. Copy the root `.env.example` to `.env.local`, set `VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co`, and confirm `VITE_CONTACT_EMAIL`. Leave `VITE_CONTACT_ENDPOINT` empty. Restart Vite or rebuild and redeploy the frontend; Vite reads public configuration at build time.
6. Submit a clearly labeled test enquiry from your allowed website origin. Verify the row in `contact_enquiries`, test the error fallback, then delete your test row in the Dashboard. A successful local test alone is not evidence of a live deployment.

### Local full-stack development (optional)

Docker is needed for the full local Supabase stack, but not for `npm test` or the frontend.

```bash
npm run supabase:start
npx supabase migration up
npm run supabase:serve
```

Before serving, create `supabase/functions/.env.local` from its example and fill in the random salt. Keep both local origins in the allowlist. Set root `.env.local` to `VITE_SUPABASE_URL=http://127.0.0.1:54321`, then run `npm run dev` in another terminal. Local Studio is available at `http://127.0.0.1:54323`. These instructions assume the default Vite port 5173; update allowed origins if you use a different port.

### Security and operations

- RLS is enabled with no public policies. `anon` and `authenticated` cannot read/write either table or call the storage RPC. Only the server service role can persist submissions; visitors never receive stored records.
- Requests have an exact-origin allowlist, field/type validation, a 24KB streamed body limit, and a honeypot. CORS is not authentication and can be spoofed by non-browser clients.
- An atomic database transaction allows 3 new enquiries per normalized email and 100 globally per UTC clock hour. Email bucket keys use a secret HMAC; raw IP addresses are not collected. Limits are basic abuse protection, not bot verification. Distributed spam can exhaust the global limit; add CAPTCHA/WAF protection if needed before a wider launch.
- Unchanged retries reuse a UUID and do not create duplicate rows or consume another slot. Editing a field creates a new submission. Network failures and the 15-second browser timeout retain the draft; retry before using the email fallback if uncertain whether storage succeeded.
- Rate-limit buckets older than a day are removed on successful new submissions. Contact enquiries are retained until you delete them. Set your own retention policy, restrict Dashboard access, and review privacy wording before launch. Never log visitor messages or secret keys.
- The salt and service-role key are server-only. All `VITE_` values are public. `.env.local` files and Supabase CLI state are excluded from Git.

### Alternative form handler

`VITE_CONTACT_ENDPOINT` remains available and takes precedence over Supabase. A custom handler accepts JSON with `name`, `email`, `company`, `service`, `message`, `subject`, `submissionId`, and the `website` honeypot. It must independently validate, limit submissions, and return 2xx only once accepted. No custom endpoint is configured.

Setup follows the official Supabase documentation for [Edge Function configuration](https://supabase.com/docs/guides/functions/function-configuration), [server environment variables](https://supabase.com/docs/guides/functions/secrets), and [database migrations](https://supabase.com/docs/guides/local-development/database-migrations).

## Portfolio content

Edit `src/content.js` to update services and portfolio entries. The current portfolio contains four explicitly labeled illustrative briefs, not client work or reported results. Replace them with verified project descriptions and update the disclosure when real case studies are available.

## Design

- Palette: pale gray `#F1F3F1`, ink `#19221D`, forest green `#286044`, sage `#E3EAE4`.
- Typography: self-hosted variable DM Sans.
- Interactive controls: 4px radius for buttons and fields; circular icon-only controls.
- Light theme follows the user’s selected direction. Reduced motion is respected.
- Reference sites: [X-ARC](https://x-arc.ai/) for the applied-lab structure and [Evolvv](https://www.evolvvai.com/) for service and project organization. Epsilon copy and branding are original.

The previous generated illustrations remain in `public/` for recovery but are not referenced or displayed by the site.
