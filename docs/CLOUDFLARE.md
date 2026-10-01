# Deploy completo su Cloudflare Workers

## Impostazioni Git

Repository A1M-AP/IBANSCAN, ramo main, directory radice /. Node 22 o successivo.

- Build command: lasciare vuoto.
- Deploy command: npm run cf:deploy

Il comando esegue cf:build prima del deploy. Non usare direttamente wrangler deploy o opennextjs-cloudflare deploy da un checkout privo di .open-next: causerebbe l'errore «Could not find compiled Open Next config».

workers_dev e preview_urls sono esplicitamente abilitati. Puoi collegare un dominio personalizzato nelle impostazioni del Worker.

## Variabili pubbliche di build

NEXT_PUBLIC_SITE_URL: URL HTTPS definitivo (default https://ibanscan.com).
NEXT_PUBLIC_CONTACT_EMAIL: indirizzo pubblico di assistenza.
NEXT_PUBLIC_OPERATOR_NAME e NEXT_PUBLIC_OPERATOR_ADDRESS: ragione sociale e indirizzo del gestore. Con questi due valori e l'email, le pagine legali non sono più segnate come bozza.
Facoltativi: NEXT_PUBLIC_OPERATOR_VAT_ID (Partita IVA, mostrata nel footer), NEXT_PUBLIC_OPERATOR_PEC, NEXT_PUBLIC_HOSTING_PROVIDER (es. "Cloudflare, Inc.").

Pubblicità facoltativa: NEXT_PUBLIC_ADSENSE_CLIENT, NEXT_PUBLIC_ADSENSE_HOME_SLOT, NEXT_PUBLIC_ADSENSE_TOOL_SLOT, NEXT_PUBLIC_ADSENSE_RESOURCE_SLOT, NEXT_PUBLIC_GOOGLE_CMP_URL. Vedi ADVERTISING.md. Senza configurazione non viene mostrato nessuno spazio pubblicitario.

La versione semplificata non usa Gemini, API business o Redis e non richiede segreti per funzionare. Le vecchie variabili AI non vengono lette.

## Build e test

npm ci
npm run cf:build
npm run cf:check
npm run cf:test
npm run cf:preview

La preview manuale usa 127.0.0.1:8787; cf:test avvia una preview isolata sulla porta 8788 e la arresta al termine. cf:check è un dry-run, non pubblica il sito.

cf:build copia solo i sorgenti applicativi in .local/cloudflare-build e usa un ambiente filtrato. Nessun file .env, .dev.vars o segreto viene incluso nell'artefatto. Usa questo wrapper invece di invocare direttamente la build dell'adattatore dalla cartella con .env.local.

I dati bancari e delle filiali restano nel codice server; il browser invia soltanto paese, codice banca e codice filiale al repertorio. Il server recupera i cambi BCE senza chiavi private, al massimo una volta all'ora per istanza. I vecchi endpoint AI/API restituiscono 410.

Lingue: l'inglese è servito senza prefisso, le altre lingue sotto /it, /de, /fr, /es. Il routing usa redirect e rewrite di next.config.ts (nessun proxy/middleware, che su Workers è solo sperimentale). Le pagine sono pre-generate per ogni lingua.

Protezione: aggiungi in Cloudflare una regola WAF di rate limiting su /api/* (ad es. 60 richieste al minuto per IP).

Il cache adapter statico di OpenNext serve sitemap, robots e immagine Open Graph senza richiedere un bucket R2. I cambi usano una risposta HTTP pubblicamente memorizzabile, non ISR. Osservabilità Wrangler disabilitata per impostazione predefinita.
