# EZPZ Windows

Instant-quote web app for hurricane impact windows and doors in South Florida.

## Stack

- **Frontend:** React 19 + Vite 5 + Tailwind 4
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Email:** Resend (transactional quote + OTP emails)
- **Hosting:** Vercel
- **PDF:** html2pdf.js (client-side) + pdf-lib (edge fallback)

## Development

```sh
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # eslint
```

Local dev requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## Routing

| Path | Served by | Purpose |
|---|---|---|
| `/` | React SPA | Landing + quote builder |
| `/admin`, `/admin/*` | React SPA | Internal quote admin |
| `/terms`, `/contact` | React SPA | Legal + contact form |
| `/faq` | Static HTML in `public/` | SEO + AI-crawler FAQ |
| `/hurricane-impact-windows-vs-shutters` | Static HTML | SEO comparison |
| `/miami-dade-noa-explained` | Static HTML | SEO technical guide |
| `/best-hurricane-impact-window-brands` | Static HTML | SEO brand comparison |
| `/florida-hurricane-window-code-requirements` | Static HTML | SEO code guide |
| `/robots.txt`, `/sitemap.xml` | Static files | SEO infrastructure |

The static SEO pages are served directly by Vercel (`cleanUrls: true`) so AI crawlers see real HTML, not the empty SPA shell.

## Project layout

```
src/
  components/         # Landing, Header, quote-flow steps, admin
  context/            # QuoteContext + PricingContext
  data/products.js    # Window/door catalog, glass types, price lookup
  lib/                # Supabase client, PDF generation
supabase/
  functions/          # Edge functions: submit-quote, send-otp, verify-otp
  migrations/         # Schema migrations
public/
  *.html              # Pre-rendered SEO content pages
  robots.txt          # AI-bot allowlist
  sitemap.xml
  types/              # Product thumbnail SVGs
  logo.svg
index.html            # Shell + JSON-LD + prerendered hero/FAQ for crawlers
vercel.json           # Routing + clean URLs + caching headers
```

See `CLAUDE.md` for project-specific context (Supabase project ref, pending tasks, etc.).
