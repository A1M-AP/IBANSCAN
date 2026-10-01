# Deployment and operations

IBANScan is a Next.js application with statically generated pages in five languages and a local browser IBAN engine. No database, user account, payment provider, AI key or secret is needed. The server only answers bank-code lookups from bundled registers (`/api/banks`) and relays ECB reference rates (`/api/rates`).

## Run and release

Use Node.js 22 LTS or newer with npm. Install dependencies with `npm ci`, copy `.env.example` to `.env.local`, then run `npm run dev`. On a fresh checkout run `npx next typegen` before `npm run check`; this generates the Next.js route types used by TypeScript. Run `npm run check` and `npm run test:e2e` before releasing. Use `npm run build` followed by `npm start` for a production Node deployment. For Cloudflare Workers see [CLOUDFLARE.md](CLOUDFLARE.md).

The supplied Dockerfile builds a standalone runtime image that runs as the non-root `node` user. Public values are build arguments because pages are prerendered and embed them:

```sh
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.example \
  --build-arg NEXT_PUBLIC_CONTACT_EMAIL=info@your-domain.example \
  --build-arg NEXT_PUBLIC_OPERATOR_NAME="Your Company S.r.l." \
  --build-arg NEXT_PUBLIC_OPERATOR_ADDRESS="Via Example 1, 00100 Roma, Italia" \
  --build-arg NEXT_PUBLIC_OPERATOR_VAT_ID=IT01234567890 \
  --tag ibanscan:local .
```

## Public configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin used for canonical links, hreflang, sitemap and Open Graph. Defaults to `https://ibanscan.com`; **set it to your real domain**. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact address on Contact and legal pages. |
| `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_OPERATOR_ADDRESS` | Legal name and address of the site operator. |
| `NEXT_PUBLIC_OPERATOR_VAT_ID`, `NEXT_PUBLIC_OPERATOR_PEC`, `NEXT_PUBLIC_HOSTING_PROVIDER` | Optional VAT number (Partita IVA, shown in the footer), certified email and hosting provider name. |
| `NEXT_PUBLIC_ADSENSE_*`, `NEXT_PUBLIC_GOOGLE_CMP_URL` | Optional advertising, see [ADVERTISING.md](ADVERTISING.md). |

Legal pages stay marked as drafts until name, address and contact email are all set. Once they are, the draft notices disappear and the pages show the data controller, the legal basis for hosting logs, data-subject rights and the operator identity. These texts describe the default application; have them reviewed for your jurisdiction and update them if you add providers (analytics, advertising, other hosting).

## Languages and URLs

English is served at unprefixed URLs (`/tools`); Italian, German, French and Spanish at `/it/tools`, `/de/tools` and so on. Every page carries a canonical link and `hreflang` alternates, and the sitemap lists every language edition. `/en/...` permanently redirects to the unprefixed URL. Choosing a language stores the `ibanscan-locale` cookie, so unprefixed URLs then redirect (307) to the chosen language. The routing is implemented with `next.config.ts` redirects and rewrites into `app/[lang]`, not with a proxy/middleware, so it works on Node and on Cloudflare Workers alike.

## Caching and request protection

Pages are prerendered per language and can be cached by a CDN. The ECB rates are downloaded at most once per hour per server instance; concurrent requests share one download, and a verified publication up to four days old is reused while the ECB is unreachable (its own reference date is always displayed). Bank lookups are served from memory.

The public endpoints do no expensive work, but add provider-level protection for internet exposure: on Cloudflare, a WAF rate-limiting rule for `/api/*` (for example 60 requests per minute per IP) plus bot protection; behind another ingress, equivalent connection and request limits. Do not log request query strings for `/api/banks` longer than necessary: they contain bank codes, never full IBANs.

`lib/server/rate-limit.ts` and `lib/server/http.ts` are tested building blocks kept from the retired Business API; the current public endpoints do not use them.

## Readiness and release checks

`GET /api/health` reports that validation, the bank directory and on-demand rates are available; it does not probe the ECB. After deploying, check the homepage in every language, a German or Italian IBAN with a bank match, the currency converter, `/sitemap.xml`, and that canonical/hreflang links use your real domain. Do not claim to verify account ownership, account activity, funds, or universal bank-directory coverage.

## Retired features

The AI assistant and the authenticated Business API have been retired. `/ai`, `/api`, `/api/docs` and `/api/playground` permanently redirect to Tools; `/api/ai` and `/api/v1/*` return HTTP 410 and never contact a provider. `db/schema.sql`, `lib/plans.ts` and the remaining `lib/server/*` modules (authentication and administration contracts) are not used by the running application.
