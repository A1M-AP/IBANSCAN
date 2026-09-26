# Google Gemini, languages and bank profiles

## Enable genuine Google AI

Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Keep it in a private `.env.local` or the deployment's server secret manager:

```dotenv
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your-private-key
GOOGLE_AI_MODEL=gemini-3.5-flash-lite
```

Use a model available to your Google project. The model remains configurable. Never prefix this key with `NEXT_PUBLIC_`, put it in browser code, or commit the populated environment file. Restrict the key to the relevant API and configure quotas/budget controls in Google. For the Windows preview, stop with **Ferma IBANScan.cmd**, then start with **Avvia IBANScan.cmd** after changing configuration.

For public production, configure `APP_URL`, `RATE_LIMIT_HASH_SECRET` and the appropriate Redis/single-process rate-limit option from `deployment.md`. The launcher supplies local-only rate-limit defaults. No Google credential is bundled with the application.

The backend calls Google's native HTTPS `generateContent` endpoint using the `x-goog-api-key` header, bounded requests and current `generationConfig.responseFormat.text` structured output. The model interprets the question and selects application evidence; the server renders only verified evidence IDs in the selected language. Full IBANs, BBANs and account identifiers do not reach Google. Free-text questions are redacted but users should still avoid including personal information. A key is necessary for a real provider roundtrip; mocked tests verify transport and grounding without spending credits.

Missing credentials produce an explicit unavailable response. Provider refusals, truncated responses and invented evidence are rejected. `GET /api/ai` indicates configuration, not successful connectivity. `AI_PROVIDER=openai-compatible` preserves the alternative integration with `AI_API_KEY`, `AI_MODEL` and `AI_BASE_URL`.

References reviewed 22 September 2026: [Google structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [GenerateContent reference](https://ai.google.dev/api/generate-content), [Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

## Language behavior

English, Italian, German, Spanish and French are selectable in the header. The `ibanscan-locale` preference cookie lasts one year, uses `SameSite=Lax`, and adds `Secure` on HTTPS. It contains only a supported language code. There is no automatic transmission of the IBAN when changing language.

The server reads the preference per request, renders the correct `html lang`, and provides the same dictionary to client components. A language switch refreshes the route in place. Validation messages are localized from structured check IDs; the mathematical engine and the public API contract remain unchanged. Country names use `Intl.DisplayNames`. The core interface, tool catalog, reference pages and seven guides have translated editions. The detailed developer reference and legal draft bodies are explicitly labeled as English where applicable.

URLs retain their existing paths and canonical identities. There are no fictitious alternate-language URLs or `hreflang` entries. Pages that read the language cookie are rendered on demand; do not cache personalized HTML at a CDN without an explicit correct language cache key. Default uncookied requests use English. A future independently indexed language URL scheme can build on the dictionaries.

## Bank profiles and visual changes

The interface shows the verified institution name, official website/contact page, sourced public telephone where available, and sourced office address. Headquarters and registered offices are labeled distinctly. Missing headquarters information is explicitly unavailable; account holder and branch addresses are not inferred. Five verified mappings are included; this is not a comprehensive worldwide banking directory. See `data-sources.md` for field-level provenance and review dates.

Neutral grayscale design tokens cover both themes. Shared responsive refinements provide fluid headings, softer corners and short hover transitions while honoring reduced-motion preferences. The navigation switches to its mobile menu below 981 pixels to accommodate translated labels and the persistent language selector.
