# IBANScan

A responsive multilingual IBAN and currency utility, built with Next.js, TypeScript and React. English, Italian, German, French and Spanish, each at its own indexable URL (`/`, `/it`, `/de`, `/fr`, `/es`) with hreflang; light and dark themes; keyboard-accessible, motion-safe vector illustrations and readable typography.

## Features

- Local IBAN structure and MOD-97 checks, formatting, country information, bulk/CSV validation and export.
- Italian IBAN calculation from ABI, CAB and account number, including national CIN. Other countries accept a bank-supplied BBAN.
- BIC search and bank details: Banca d'Italia register with branches for Italy, national bank-code registers for 43 more countries (Germany, Spain, Austria, Switzerland, Netherlands, Belgium, Poland and others). Bank/branch codes are the only scan fields sent to the directory; full IBANs and account numbers remain on the device.
- Separate bank headquarters, registered office, branch addresses, individually verified PEC contacts and dated EPC membership in four SEPA schemes.
- ECB daily reference exchange rates, browser-side currency conversion and the official SIX ISO 4217 currency list.
- Optional AdSense display placements; nothing is shown and no ad request is made until publisher IDs, certified CMP and consent are present.
- Contact page, footer and legal pages filled from NEXT_PUBLIC_CONTACT_EMAIL and NEXT_PUBLIC_OPERATOR_* (name, address, VAT number, PEC). MAP Technologies footer credit.

AI and the Business API have been retired. Their old landing routes redirect to Tools; their endpoints return 410 and never call an AI provider. Gemini credentials are no longer needed. No payment, subscription or account-history database is enabled.

## Local development and production

Node 22+ is required. Run npm ci, npm run dev. For production run npm run build then npm start. Windows users can launch **Avvia IBANScan.cmd** and stop it with **Ferma IBANScan.cmd**.

Copy .env.example to a local ignored environment file if you need a public canonical URL or contact address. Never commit private environment files. No secrets are required for the core tools.

Checks: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. The browser tests cover five languages, responsive layouts, accessibility, privacy, bank details, calculator, conversion and failure states.

## Cloudflare Workers

Use the complete Workers/OpenNext deployment, not Pages static export. See docs/CLOUDFLARE.md. Dashboard build command: leave empty. Deploy command: **npm run cf:deploy**. This command builds the OpenNext artifact before deployment.

## Data and advertising

See docs/REFERENCE-DATA.md for sources, refresh command, matching rules and limitations. See docs/ADVERTISING.md for AdSense and consent configuration. Imported snapshots are versioned; they are not a real-time universal bank directory. The site displays the retrieval date and explicitly marks unavailable fields. Reference currency rates are not real-time trading quotes.

IBANScan does not confirm account ownership, balance or whether an account is active. Before a public launch set NEXT_PUBLIC_SITE_URL to your domain and the operator variables (see docs/deployment.md), then have the legal texts reviewed for your jurisdiction.
