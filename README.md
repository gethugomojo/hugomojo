# HugoMojo Website

Static website for HugoMojo, built for GitHub deployment.

## Pages

- `index.html` — homepage
- `scanner.html` — 16-question AI Income Scanner
- `delivery.html` — product delivery and kit overview
- `terms.html` — public terms of service
- `refund.html` — public refund policy
- `privacy.html` — public privacy notice
- `access.html` — automatic delivery page after checkout
- `success.html` — post-purchase delivery and optional Master Key Annual Access upgrade window
- `contact.html` — support and contact page
- `404.html` — GitHub Pages not-found page
- `robots.txt` — crawler access file
- `sitemap.xml` — sitemap for hugomojo.com

## Contact

Support email: hi@hugomojo.com

## Pricing Model

- Single Pass: $9.90, one matched Action System.
- Master Key: $19.90, all three Action Systems, prompt library, 90-day roadmap, and 90-day updates.
- Annual Access: $199 per year, full Master Key package, Annual Member System PDF, monthly ecosystem signal reports, versioned prompt library updates, weekly signal digest, execution tracker, and quarterly path calibration.

## Automatic Delivery URLs

Configure these as checkout success URLs in Creem or your payment processor.

Use `success.html` for Single Pass and Master Key purchases so the customer sees the Annual Access upgrade window first, then clicks through to `access.html` for delivery:

- Hunter Single Pass success URL: `https://hugomojo.com/success.html?plan=single&role=H`
- Artisan Single Pass success URL: `https://hugomojo.com/success.html?plan=single&role=A`
- Architect Single Pass success URL: `https://hugomojo.com/success.html?plan=single&role=C`
- Master Key success URL: `https://hugomojo.com/success.html?plan=master`

Use `access.html` for Annual Access and Annual Access upgrade purchases because no further upgrade offer is needed:

- Annual Access success URL: `https://hugomojo.com/access.html?plan=annual`
- Annual Access Upgrade success URL: `https://hugomojo.com/access.html?plan=annual&upgrade=1`

The final delivery URLs are:

- Hunter Single Pass: `https://hugomojo.com/access.html?plan=single&role=H`
- Artisan Single Pass: `https://hugomojo.com/access.html?plan=single&role=A`
- Architect Single Pass: `https://hugomojo.com/access.html?plan=single&role=C`
- Master Key: `https://hugomojo.com/access.html?plan=master`
- Annual Access: `https://hugomojo.com/access.html?plan=annual`
- Annual Access Upgrade: `https://hugomojo.com/access.html?plan=annual&upgrade=1`

Annual Access delivery includes:

- `downloads/annual-access-member-system.pdf`
- `downloads/annual-access-welcome.md`
- `downloads/quarterly-calibration-form.md`
- `downloads/hugomojo-annual-execution-tracker.xlsx`
- `downloads/prompt-vault-index.md`
- `downloads/monthly-signal-report-template.md`
- `downloads/weekly-signal-digest-template.md`
- all Master Key assets

Master Key delivery includes:

- all three upgraded Single Pass Action Systems
- `downloads/hugomojo-market-fit-model.md`
- `downloads/master-key-prompt-library.md`
- `downloads/master-key-90-day-roadmap.md`

Public navigation should only expose:

- Header: Home, Scanner, Contact
- Footer: Delivery, Contact, Privacy, Terms, Refund

Internal pages such as Creem readiness, data system, and compliance checklist should not be linked from public navigation.

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
