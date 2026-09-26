# IBANScan

**Scan. Verify. Understand.** A privacy-conscious IBAN toolkit built with Next.js, React and TypeScript.

Validation, analysis, formatting, country checks, IBAN check-digit generation and bulk/CSV tools work without accounts, a database or paid credentials. The browser validates country format, length, BBAN structure and the international MOD-97 checksum. Bank/BIC information is shown only when the included sourced dataset has a verified mapping. SEPA country membership does not establish a particular bank's participation.

IBANScan does not verify account ownership, account activity, balances or the existence of funds. National account checks are not performed. The generator calculates international check digits from a supplied BBAN; it does not open or issue an account.

## Local development

### Windows launcher

Double-click **Avvia IBANScan.cmd** to prepare the current production build, start a local background server and open the browser. Double-click **Ferma IBANScan.cmd** to stop that preview. The launcher binds only to `127.0.0.1`, reuses an existing managed preview, and selects a free port from 3000–3020 without terminating other programs. Restart after source changes to rebuild automatically. State and logs live in the ignored `.local` directory. See **LEGGIMI - Launcher.txt** for Italian instructions.

The launcher reads local production environment files for optional integrations. Its single-process rate limits and ephemeral hash secret are local testing defaults; use the production configuration in the deployment guide for public hosting.

Use Node.js 22 LTS or newer and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Core tools need no environment file. For optional integrations, copy `.env.example` to `.env.local` and provide the values described in [deployment and operations](docs/deployment.md). Never commit real secrets.

## Checks

```sh
npx next typegen
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`next typegen` creates generated route types before TypeScript checking on a fresh checkout. After `npm run build`, the browser suite starts its own production server when needed and covers scanning, validation errors, local-only processing, sharing, CSV import/export, responsive layouts, dark mode, accessibility and SEO. Set `PLAYWRIGHT_BASE_URL` to test an already running preview. On a fresh Linux machine, use `npx playwright install --with-deps chromium` to install browser system dependencies as well. Unit tests cover the country engine, CSV parsing/export, API authentication, rate limits, provider errors and AI evidence validation.

GitHub Actions runs these checks and builds/smoke-tests the production Docker image. No live AI or other paid service credentials are needed in CI. Mocked provider tests verify the integration contract; they do not certify a live provider account.

## Production

```sh
npm run build
npm start
```

The build prepares the Next.js standalone server with its public and static assets. `npm start` launches that server. Supply server secrets through the runtime environment; do not rely on a source-tree `.env.local` being carried into a standalone deployment. Public values such as `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` must be configured before building because static content and browser bundles embed them.

Alternatively, build the supplied non-root Docker image:

```sh
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://ibanscan.com --tag ibanscan:local .
docker run --rm --publish 127.0.0.1:3000:3000 --env APP_URL=https://ibanscan.com ibanscan:local
```

The image serves the core product immediately. Put an HTTPS reverse proxy or managed HTTPS ingress in front of it for public deployment. Optional server secrets can be supplied by your deployment's secret manager or a private Docker environment file. Never pass secrets as Docker build arguments. The Docker context excludes local environment files and private-key files; only the traced server runtime, compiled application and public assets are included in the final image. `/api/health` is a liveness/configuration endpoint, not a live AI or Redis connectivity test.

## Optional services and release configuration

| Feature | Configuration |
| --- | --- |
| Canonical URLs and origin checks | `NEXT_PUBLIC_SITE_URL` at build time; `APP_URL` at runtime |
| Contact page | `NEXT_PUBLIC_CONTACT_EMAIL` at build time |
| Genuine AI explanations | `AI_PROVIDER=google`, `GOOGLE_AI_API_KEY`, `GOOGLE_AI_MODEL`; or an OpenAI-compatible provider |
| Authenticated validation API | `IBANSCAN_API_KEY_HASHES` with operator-provisioned SHA-256 key digests |
| Production request protection | `RATE_LIMIT_HASH_SECRET` plus Redis REST credentials, or the documented single-process option |
| AI spending guard | `AI_GLOBAL_DAILY_LIMIT` and a provider-side spending cap |
| Future accounts, subscriptions and administration | Adapter contracts and PostgreSQL schema; no public admin, payments or login are enabled |

Without optional service configuration, AI and API requests return explicit unavailable responses. AI uses a real configured model to interpret questions and choose relevant verified facts; the server renders only validated application evidence, preventing model-authored bank/BIC/ownership claims. Full IBANs and account identifiers are omitted from provider context. Visitors must consent before sending an IBAN to the AI backend.

See [.env.example](.env.example) and [deployment and operations](docs/deployment.md) for key provisioning, trusted-ingress rules, distributed limits, readiness checks and release prerequisites. Legal pages are transparent initial content that must be completed with the operating entity, actual processors, retention terms and contact details before public operation. Advertising and analytics are disabled by default; they are integration boundaries, not installed tracking or advertising providers.

## Project map

- `app/`: public pages, SEO metadata, legal pages and server routes.
- `components/`: responsive interface and interactive tools.
- `lib/iban.ts`, `lib/countries.ts`, `lib/banks.ts`: validation and sourced banking data.
- `lib/server/`: guarded API authentication, request limits and grounded AI.
- `lib/csv.ts`: bounded local CSV parsing and formula-safe export.
- `locales/`: complete English, Italian, German, Spanish and French interface dictionaries.
- `db/schema.sql`: future tenant, subscription, usage and administration schema.
- `tests/`, `e2e/`: automated engine, security and browser coverage.
- `docs/`: source provenance and operational documentation.

Shared-result links carry the IBAN in a URL fragment, require explicit confirmation, and are consumed locally; anyone receiving such a link can read the IBAN. Normal validation and CSV processing do not transmit IBANs. Browser preferences are the color theme in local storage and a one-year, first-party language cookie. See [Google AI, languages and bank profiles](docs/google-ai-and-languages.md).
