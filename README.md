# Epsilon Labs Portfolio

A responsive portfolio site for Epsilon Labs, an AI and data consultancy helping growing businesses turn connected data into practical AI systems.

The current design uses the selected pale-gray and forest-green editorial theme. It has no pictures, gradients, external font requests, trackers, or automatic animations. Service descriptions expand, portfolio examples filter by category, and visitors can prepare a project enquiry.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Contact form

Without configuration, the form validates the visitor’s details and prepares an email draft addressed to `hello@epsilonlabs.org`. The visitor must open their email app and send it. The site does not claim delivery, and nothing is transmitted by the Prepare enquiry button. A copy option and selectable draft provide a fallback when no email app is configured.

Confirm the real inbox before launch. Configure `VITE_CONTACT_EMAIL` in `.env.local` to change it, then rebuild. `.env.example` lists the supported settings.

To enable direct submissions, set `VITE_CONTACT_ENDPOINT` to your public form handler. It must accept a JSON POST with `name`, `email`, `company`, `service`, `message`, and `subject`; validate fields server-side; implement spam protection and rate limits; and return a 2xx response only once the enquiry has been accepted for delivery. The handler must permit the website’s origin if hosted on another domain. Non-2xx responses, connection failures, and a 15-second timeout retain the draft and offer email as a fallback. No delivery service is provisioned by this repository.

All `VITE_` values are public browser configuration. Do not put API keys or server secrets in them.

## Portfolio content

Edit `src/content.js` to update services and portfolio entries. The current portfolio contains four explicitly labeled illustrative briefs, not client work or reported results. Replace them with verified project descriptions and update the disclosure when real case studies are available.

## Design

- Palette: pale gray `#F1F3F1`, ink `#19221D`, forest green `#286044`, sage `#E3EAE4`.
- Typography: self-hosted variable DM Sans.
- Interactive controls: 4px radius for buttons and fields; circular icon-only controls.
- Light theme follows the user’s selected direction. Reduced motion is respected.
- Reference sites: [X-ARC](https://x-arc.ai/) for the applied-lab structure and [Evolvv](https://www.evolvvai.com/) for service and project organization. Epsilon copy and branding are original.

The previous generated illustrations remain in `public/` for recovery but are not referenced or displayed by the site.
