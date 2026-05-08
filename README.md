# HugoMojo Website

Static website for HugoMojo, built for GitHub deployment.

## Pages

- `index.html` — homepage
- `scanner.html` — 16-question AI Income Scanner
- `delivery.html` — product delivery and kit overview
- `membership.html` — pricing ladder and Annual Vault membership page
- `access.html` — automatic delivery page after checkout
- `success.html` — post-purchase Annual Vault upgrade window
- `data-system.html` — event taxonomy and KPI dashboard design
- `creem-application.html` — payment review readiness notes
- `compliance.html` — compliance, privacy, refund, and responsible use information
- `contact.html` — support and contact page
- `404.html` — GitHub Pages not-found page
- `robots.txt` — crawler access file
- `sitemap.xml` — sitemap for hugomojo.com

## Contact

Support email: hi@hugomojo.com

## Pricing Model

- Single Pass: $9.90, one matched role report.
- Master Key: $19.90, all three role reports, Prompt Vault, 90-day roadmap, and 90-day updates.
- Annual Vault: $199 per year, full Master Key package, private access, monthly toolkits, and quarterly path calibration.

## Automatic Delivery URLs

Configure these as checkout success URLs in Creem or your payment processor:

- Hunter Single Pass: `https://hugomojo.com/access.html?plan=single&role=H`
- Artisan Single Pass: `https://hugomojo.com/access.html?plan=single&role=A`
- Architect Single Pass: `https://hugomojo.com/access.html?plan=single&role=C`
- Master Key: `https://hugomojo.com/access.html?plan=master`
- Annual Vault: `https://hugomojo.com/access.html?plan=vault`
- Annual Vault Upgrade: `https://hugomojo.com/access.html?plan=vault&upgrade=1`

## Data Layer

The site includes `assets/tracking.js`, a lightweight static-site event layer.

It creates anonymous visitor and session ids, pushes events into `window.dataLayer`, and stores the latest events in localStorage until connected to GA4, Plausible, PostHog, or a custom endpoint.

Tracked event examples:

- `page_view`
- `scanner_start`
- `scanner_complete`
- `email_capture`
- `checkout_click`
- `upsell_click`

## Deployment

This is a static site. It can be deployed with GitHub Pages, Vercel, Netlify, or any static hosting provider.

For GitHub Pages:

1. Push this folder to a GitHub repository.
2. Enable GitHub Pages in repository settings.
3. Select the root folder or configure deployment to serve this directory.

## Preflight Checks

Run from the parent workspace:

```bash
rg -n "[\\p{Han}]" hugomojo-site || true
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('hugomojo-site/scanner.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(m => m[1]).join('\\n');
new Function(scripts);
console.log('Scanner script syntax ok');
console.log('Q markers:', (scripts.match(/dim:"Q\\d+ ·/g) || []).length);
NODE
```

Expected:

- No Chinese characters in production site files.
- Scanner script syntax passes.
- Scanner has 16 question markers.
