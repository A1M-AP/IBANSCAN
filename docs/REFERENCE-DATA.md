# Reference data

Run Python 3 and Node 22+: python scripts/sync-reference-data.py. No private credentials are needed. This imports current EPC scheme registers, SIX ISO 4217, and the public Banca d'Italia register and branch list. Review the resulting diff and tests before publishing. Each successful dataset is replaced atomically; failed downloads never overwrite it. Snapshot dates are displayed to users. No IBANs, customer data, or session cookies are saved.

Institution data and the branch directory stay on the server. A scan sends only country, institution code and branch code to /api/banks. The account number and full IBAN stay on the device. Branches are matched on ABI plus CAB; multiple matches remain visible rather than choosing one.

The Banca d'Italia UI labels intermediaryTellers[0] as Direzione Generale and [1] as Sede Legale. These fields are retained separately. Registry addresses can differ from a bank's own published address; independently reviewed bank records take priority and carry their own source date.

EPC BICs represent scheme participation, not guaranteed payment routing. Only exact unique legal-name matches within the same country are joined to domestic identifiers (punctuation/case normalisation only); ambiguous/unmatched BICs remain unavailable. Curated mappings have independent sources. Missing scheme membership is unknown, not unsupported. Effective and leaving dates are evaluated before showing participation.

EPC records are attributed, normalised and enriched as part of the IBAN utility. Do not market the raw EPC registry as a standalone product. See the EPC register page for its disclaimer and reuse conditions.

PEC data is not supplied by the current public Italian register response. data/bank-contacts.json contains individually reviewed contacts from official bank websites; complaints addresses are explicitly labelled. No global completeness is claimed. Never infer a certified email from a bank domain.

Exchange rates come directly from the ECB daily XML, cached for up to an hour by a supporting edge cache. Publication date is always shown, including weekends. These are reference rates, not live trade prices. Failed downloads display unavailable, not synthetic fallback rates.

The 2026-09-26 Italian snapshot contains 415 registry records representing 414 unique ABI identifiers; one identical BANK SEPAH record occurs twice upstream. Conflicting duplicate ABI records cause refresh to fail before replacement.
The browser also receives `italian-bank-names.json`, a compact ABI-to-name index generated from the same official Italian snapshot. This lets a valid Italian IBAN display a verified bank name even when the detailed directory request fails. It contains no accounts, addresses or guessed BICs. The synchronization test checks it against the full register. Detailed lookup distinguishes loading, request failure (with retry), and an absent verified match; only country, bank and branch identifiers are sent.
Display labels are maintained in `data/display-names.json`. Regenerate them with `node scripts/generate-display-names.mjs` after updating the country/currency lists, and review the resulting translation changes. Sharing this snapshot prevents differences in Node, Chromium and Workers ICU dictionaries from breaking hydration. Homepage scanner examples use synthetic account numbers with verified bank identifiers; official SWIFT registry examples remain unchanged for conformance testing.

## National bank-code registers (outside Italy)

`data/national-banks.json` maps bank codes to bank names and BICs for 44 countries (about 23,000 codes). It is imported from the MIT-licensed [schwifty](https://github.com/mdomke/schwifty) package with `python scripts/import-bank-registries.py [version]`. The script downloads a pinned release from PyPI, verifies its SHA-256 against PyPI's metadata and keeps only codes whose length matches the bank-identifier position of that country's IBAN. Only bank code, name and BIC are stored.

schwifty's `generated_*` files come from national central-bank or clearing registers (for example the Deutsche Bundesbank's bank-code file); its `manual_*` files (for example France, the United Kingdom, Portugal, Denmark) are community-curated. Each entry keeps that distinction and bank details from a curated list carry an explicit caveat. Where the same country has both, register rows win. The Banca d'Italia directory remains authoritative for Italy; the national register only supplies a BIC when the Italian directory has none. Lookups are exact code matches; unknown codes stay unavailable.
