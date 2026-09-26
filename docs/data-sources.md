# IBAN and banking data

Reviewed on 20 September 2026. Validation is offline and deterministic; it makes no banking-network request and cannot establish account ownership, balance, activity or existence.

## National formats

The checked-in `data/iban-registry.json` contains the 89 formats in [SWIFT's ISO 13616 IBAN Registry, release 103, September 2026](https://www.swift.com/swift-resource/9606/download). SWIFT is the ISO 13616 registration authority. Only format facts are transcribed: country names/codes, national lengths, BBAN patterns, example IBANs, and bank/branch offsets. No contact-directory content is copied. All 89 published examples pass length, structure and MOD-97 regression tests.

This release incorporates Brazil's alphanumeric bank-identifier change. The registry's `n`, `a` and `c` notation is translated to ASCII numeric, alphabetic and alphanumeric patterns. All lengths are exact. Offsets in application configuration are zero-based relative to the BBAN, not the full IBAN.

Separate bank and branch fields follow the registry. For example, this edition leaves the France and Portugal branch-position fields blank; those fields are not guessed. Account extraction is optional and limited to explicitly mapped national segments. In Czechia and Slovakia, the exported account segment includes the account prefix. In countries with auxiliary suffixes the account segment may exclude domestic control digits. Icelandic national identifiers are not labeled as account numbers. Unsupported fields are returned as `null`.

No domestic account checksum is evaluated in this release. In particular, a correct international MOD-97 checksum does not establish correctness of Italy's CIN, France's RIB key, Spain's domestic control digits or a German bank's domestic account rules. The UI and API must describe validation as registered length/structure plus the **international** checksum. `generateIban` accepts an existing BBAN and calculates international digits only; it neither opens an account nor corrects domestic check digits. Examples are reference examples, never payment instructions.

## SEPA

Geographic scope comes from the [European Payments Council's list of SEPA scheme countries, EPC409-09 v8.0, issued 24 December 2025](https://www.europeanpaymentscouncil.eu/document-library/other/epc-list-sepa-scheme-countries) and [current EPC overview](https://www.europeanpaymentscouncil.eu/about-sepa). This deliberately takes precedence over stale per-country SEPA flags in the IBAN registry. Albania, Montenegro, Moldova, North Macedonia and Serbia are included.

The EPC describes 41 countries, plus covered territories. There are 42 supported IBAN prefixes in the SEPA scope set because Gibraltar has a separate GI format. GB covers the Crown Dependencies. FR covers several overseas territories, **some outside SEPA**; a prefix cannot identify that exception. A `sepa: true` result means the registered country/prefix is represented in the geographic scope. It does not confirm the particular account's location, currency, bank adherence, instant-payment participation or eligibility for a payment. Confirm actual scheme participation with the bank or EPC participant registers.

National currencies are deliberately not populated: an IBAN generally does not establish an account's currency. Even currency characters in a national format are not proof of an active account.

## Verified bank dataset

The local dataset is intentionally limited to the mappings below. ABN AMRO and NatWest mappings were checked on 20 September 2026; the additions and all contact/office details were checked on 22 September 2026. A verification date records our review, not a promise that a static source is current in real time.

| Country / identifier | Published bank | Published BIC | Evidence |
| --- | --- | --- | --- |
| NL / ABNA | ABN AMRO Bank N.V. | ABNANL2A | [ABN AMRO's IBAN and BIC explanation](https://www.abnamro.nl/en/personal/payments/making-payments/iban.html), which explicitly names both ABNA and ABNANL2A |
| GB / NWBK | National Westminster Bank Plc | NWBKGB2L | [NatWest's IBAN and BIC explanation](https://www.natwest.com/business/trade-finance/online-solutions-and-tools/iban.html) and [receiving international transfers](https://www.natwest.com/business/support-centre/making-and-accepting-payments/electronic-payments/receiving-international-transfers.html) |
| IT / 03069 | Intesa Sanpaolo S.p.A. | BCITITMM | [Intesa's corporate data](https://group.intesasanpaolo.com/en/footer-pages/corporate-data), which publishes ABI 3069.2 (five-digit bank code 03069, followed by its separate check digit), and [Intesa IMI KYC information](https://imi.intesasanpaolo.com/it/documentazione/kyc/) for the SWIFT code |
| DE / 10011001 | N26 Bank SE | NTSBDEB1XXX | [Deutsche Bundesbank's bank sort-code directory](https://www.bundesbank.de/en/homepage/search/bank-sort-codes-search) explicitly lists bank code 10011001, N26 Bank and this BIC; [N26's imprint](https://n26.com/en-de/imprint) confirms the legal name |
| ES / 0049 | Banco Santander, S.A. | BSCHESMMXXX | [Santander's legal notice](https://www.bancosantander.es/aviso-legal) for entity code 0049 and [Santander's SWIFT/BIC page](https://www.bancosantander.es/empresas/negocio-internacional/cobros-pagos-internacionales/calcular-swift) for the BIC |

These are bank-level mappings, not confirmation that the entered account is maintained there, nor that a branch-specific BIC is suitable for a particular transaction. All other results use **Bank information unavailable**. Italian ABI/CAB extraction returns numeric identifiers; the name is resolved only for explicitly documented ABI mappings. No branch address is inferred. In particular, the registry's sample `IT60 X054 ...` does not itself establish the current bank associated with ABI 05428. France has format validation but no verified local bank-directory entry at present.

### Contacts and offices

| Bank | Office evidence and classification | General customer contact evidence |
| --- | --- | --- |
| ABN AMRO | [Official organisation page](https://www.abnamro.nl/en/personal/overabnamro/index.html): headquarters, Gustav Mahlerlaan 10, 1082 PP Amsterdam | [Service/contact](https://www.abnamro.nl/en/personal/contact/index.html); [published telephone numbers](https://www.abnamro.nl/en/personal/contact/overview-all-telephone-numbers.html), +31 10 241 17 20 for daily banking from abroad |
| NatWest | [Website terms](https://www.natwest.com/website-terms-and-conditions.html): registered office, 250 Bishopsgate, London EC2M 4AA | [Official support](https://www.natwest.com/support-centre/contact-us.html), +44 3457 888 444 for general personal-banking enquiries from abroad |
| Intesa Sanpaolo | [Corporate data](https://group.intesasanpaolo.com/en/footer-pages/corporate-data): registered office, Piazza San Carlo 156, 10121 Torino | [Official contacts](https://group.intesasanpaolo.com/it/pagine-footer/contatti), +39 011 8019200 from abroad |
| N26 | [Imprint](https://n26.com/en-de/imprint): registered office, Voltairestraße 8, 10179 Berlin | [Official support instructions](https://support.n26.com/en-de/app-and-features/app/how-to-contact-n26). No general public telephone number is supplied; telephone support is limited to eligible premium customers through the app |
| Banco Santander | [Official corporate contact page](https://www.santander.com/en/landing-pages/contact): headquarters, Ciudad Grupo Santander, Av. de Cantabria s/n, 28660 Boadilla del Monte, Madrid | [Official customer service](https://www.bancosantander.es/en/particulares/atencion-cliente), 915 123 123, stored in international form +34 915 123 123 |

An office address is corporate information, not the account-holding branch, a customer-service counter, or an instruction to visit or mail documents there. Use the official contact channel for current service availability. Registered offices are explicitly distinguished from operational headquarters. Each optional contact/office object has its own source and review date. Missing details remain unavailable; no email address, telephone number or street address is generated.

`lib/banks.ts` defines `BankDataProvider`, `createBankDataProvider`, `lookupBank` and `searchBanks`. Add an independently maintained, licensed dataset through that boundary. Every record must include source URL and verification date. Conflicting mappings fail closed. Optional details are validated at the provider boundary; malformed details are omitted without replacing them with guesses. Public links accept HTTPS only, without credentials, local/IP hosts or nonstandard ports. Returned records are isolated copies so consumers cannot alter later lookup results. Provider lookups receive country and bank identifier only, not a full IBAN. A future remote provider should live on the server, use timeouts and bounded caching, and expose no credential to the browser. Never construct a BIC by appending a country or location to a bank code.

## Update procedure

1. Review the official registry and EPC scope at each release and before deployment. Record the version and retrieval date.
2. Compare changed format lengths, patterns, offsets and reference examples. Do not silently add unofficial country codes.
3. Run the engine tests, including all registry examples, generation round trips and invalid checksum/structure cases.
4. Reconfirm bank mappings from their original sources or a licensed provider; remove mappings whose provenance cannot be maintained.
5. Update this document and the public source/freshness copy. Do not call a static dataset live or comprehensive.
