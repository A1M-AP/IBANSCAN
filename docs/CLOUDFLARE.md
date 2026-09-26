# Pubblicazione su Cloudflare Workers

L'app completa usa **Workers con OpenNext**, mantenendo Next.js, Gemini, le API protette e le lingue gestite dal server. Non selezionare Pages o il preset di esportazione statica.

## Collegamento al repository

Nel pannello Cloudflare, crea un Worker collegato al repository **A1M-AP/IBANSCAN**:

| Campo | Valore |
| --- | --- |
| Branch produzione | `main` |
| Directory principale | `/` (radice del repository) |
| Nome Worker | `ibanscan` (uguale a `wrangler.jsonc`) |
| Versione Node | `22` |
| Comando build | `npm run cf:build` |
| Comando deploy | `npx wrangler deploy` |

Non serve una directory di output Pages: `wrangler.jsonc` indica il Worker e gli asset. Se cambi il nome del Worker, aggiorna anche il file. Usa i deploy automatici solo per `main`; gli ambienti di anteprima devono avere propri URL e segreti.

Imposta come **variabile di build** `NEXT_PUBLIC_SITE_URL` con l'URL HTTPS pubblico definitivo (ad esempio `https://ibanscan.com`, oppure l'indirizzo Workers assegnato). Questo valore genera canonical, sitemap e metadati: dopo un cambio di dominio serve una nuova build. Opzionale: `NEXT_PUBLIC_CONTACT_EMAIL`.

Non aggiungere chiavi Gemini, token Redis o chiavi clienti alle variabili di build.

## Avvisi del deploy

`workers_dev: true` e `preview_urls: true` sono dichiarati esplicitamente in `wrangler.jsonc`: mantengono abilitati l’indirizzo Workers e gli URL delle versioni. Questi ultimi non sono ambienti separati. Per usare esclusivamente un dominio personalizzato, configura prima il dominio e poi imposta entrambi a `false`. [Riferimento Cloudflare](https://developers.cloudflare.com/workers/wrangler/configuration/).

Un avviso Node `DEP0190` può provenire dagli strumenti di deploy che avviano processi tramite shell. Non è un errore del sito né, da solo, la prova di una vulnerabilità sfruttata. Gli script Cloudflare del progetto avviano i processi senza `shell: true`. Non disabilitare globalmente gli avvisi Node: controlla l’esito finale del deploy e aggiorna le dipendenze dopo averle verificate. `Success: Deploy command completed` indica che il comando di pubblicazione è terminato correttamente; il funzionamento di Gemini va verificato separatamente con i segreti runtime configurati.

## Variabili del Worker (runtime)

In Settings / Variables and Secrets del Worker configura:

| Nome | Tipo | Contenuto |
| --- | --- | --- |
| `APP_URL` | Testo | L'origine HTTPS da cui verrà usato il sito, senza percorso. Deve coincidere con l'URL aperto dagli utenti per la protezione delle richieste AI. |
| `GOOGLE_AI_API_KEY` | Secret | La chiave Gemini del progetto Google. |
| `RATE_LIMIT_HASH_SECRET` | Secret | Almeno 32 caratteri casuali; vedi comando sotto. |
| `RATE_LIMIT_REDIS_REST_URL` | Secret | Endpoint HTTPS Redis REST compatibile Upstash. |
| `RATE_LIMIT_REDIS_REST_TOKEN` | Secret | Token con accesso ai comandi `EVAL`, `INCR`, `PEXPIRE`, `PTTL`. |
| `IBANSCAN_API_KEY_HASHES` | Secret, facoltativo | Array JSON di identificativi cliente, hash SHA-256 e piano, come descritto nel README. Serve solo per le API Business. |

Le opzioni non riservate `AI_PROVIDER`, `GOOGLE_AI_MODEL`, `AI_GLOBAL_DAILY_LIMIT`, `TRUSTED_IP_HEADER` e `RATE_LIMIT_ALLOW_SINGLE_INSTANCE` sono già in `wrangler.jsonc`; modifica quel file per cambiarle in modo persistente. Verifica che il modello Gemini sia disponibile per il tuo progetto Google.

Generazione del segreto per anonimizzare gli identificativi:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Redis è necessario per proteggere Gemini e le API su un servizio distribuito. Non impostare `RATE_LIMIT_ALLOW_SINGLE_INSTANCE=true` su Workers. Non vengono salvati IBAN o domande in Redis: soltanto contatori con scadenza e identificativi HMAC. Se Redis non è configurato o non risponde, le funzioni protette rifiutano la richiesta. Il validatore nel browser continua a funzionare senza Gemini, Redis e chiavi API.

`TRUSTED_IP_HEADER=cf-connecting-ip` usa l'IP impostato dall'ingresso Cloudflare. Non esporre un secondo ingresso che consenta al client di impostare questo header. Le log di osservabilità sono disattivate per impostazione predefinita.

## Build e prova locale

Richiede Node 22 o successivo e npm. Da questa cartella:

```sh
npm ci
npm run cf:build
npm run cf:check
npm run cf:test
npm run cf:preview
```

Prima di ricompilare, ferma la preview con Ctrl+C. `cf:test` avvia e arresta autonomamente una preview isolata sulla porta 8788, senza caricare i segreti locali.

La preview apre il server su `http://127.0.0.1:8787`. Il launcher originale e la build Node/Docker continuano a funzionare separatamente.

Per provare AI/API nella preview, crea `.dev.vars` (ignorato da Git) con i segreti di test e `APP_URL=http://127.0.0.1:8787`. Usa risorse di test dedicate. Non copiare questo file nel repository. L'assenza di segreti è uno stato supportato: le funzioni non configurate rispondono con 503, senza inventare risposte.

La build copia solo i sorgenti applicativi in `.local/cloudflare-build`, installa le dipendenze bloccate e produce `.open-next`. I file `.env*`, `.dev.vars*` e le credenziali del processo non entrano nella build. Questo passaggio è intenzionale: OpenNext può incorporare i file `.env` nel Worker. Usa sempre `npm run cf:build`, non il comando diretto dell'adattatore dalla cartella con i segreti locali.

## Pubblicazione da terminale (alternativa al collegamento Git)

```sh
npx wrangler login
npx wrangler secret put APP_URL
npx wrangler secret put GOOGLE_AI_API_KEY
npx wrangler secret put RATE_LIMIT_HASH_SECRET
npx wrangler secret put RATE_LIMIT_REDIS_REST_URL
npx wrangler secret put RATE_LIMIT_REDIS_REST_TOKEN
npm run cf:deploy
```

I comandi `secret put` chiedono il valore in modo interattivo: non inserirlo nella riga di comando o nella cronologia. Se abiliti le API Business, aggiungi anche `IBANSCAN_API_KEY_HASHES`. La modalità Git evita il login Wrangler sul computer locale.

## Controllo dopo il deploy

- Apri il sito, cambia lingua, valida un IBAN di esempio e prova layout mobile e tema scuro.
- Apri `/api/health`: `validation` deve essere `available`. `ai`, `api` e `requestProtection` riportano se la configurazione è presente, non garantiscono la disponibilità dei servizi esterni.
- Prova una domanda Gemini dopo il consenso. Servono una chiave valida, modello disponibile e quota Google.
- Le API senza credenziali devono essere rifiutate. Non configurare regole Cloudflare "Cache Everything" per pagine dinamiche o `/api/*`.
- Collega il dominio in Settings / Domains & Routes. Aggiorna `APP_URL` e `NEXT_PUBLIC_SITE_URL` e ricompila se cambi origine.

Gli asset versionati sono cacheabili; le risposte personali, AI e API non sono memorizzate nella cache condivisa. Questa versione non usa ISR: la cache statica OpenNext non richiede R2, D1 o Durable Objects. Se in futuro aggiungi ISR/revalidation, occorre anche configurare una cache scrivibile.

La build verifica la dimensione del bundle con `cf:check`; i limiti e i costi dipendono dal piano Cloudflare. Nessun account Cloudflare, Redis o dominio viene creato automaticamente da questi script.

Fonti tecniche: [Cloudflare OpenNext](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/), [OpenNext configurazione](https://opennext.js.org/cloudflare/get-started), [cache](https://opennext.js.org/cloudflare/caching), [limiti Workers](https://developers.cloudflare.com/workers/platform/limits/).
