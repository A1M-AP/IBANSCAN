import type { Locale } from "@/lib/i18n";
const en = {
  eyebrow: "A little clarity. For every number.",
  title: "Your money tools.",
  accent: "Simply clearer.",
  intro:
    "Check an IBAN, find a bank, calculate a currency exchange. Clear results. More room to breathe.",
  tools: "Small tools. Big clarity.",
  toolsIntro: "Everything you need, without the complications.",
  explore: "Explore all tools",
  contact: "Contact",
  contactTitle: "Let’s stay in touch.",
  contactIntro:
    "Questions, suggestions or a correction to bank information? We’re listening.",
  contactCta: "Contact us",
  credit: "Website created by MAP Technologies",
  process: "From numbers to answers.",
  steps: [
    "Enter your details",
    "See what checks out",
    "Find the information you need",
  ],
  stepTexts: [
    "IBAN checks run on your device. No account required.",
    "Country, format and international check digits, explained clearly.",
    "Bank identifiers, source-backed bank details and SEPA participation.",
  ],
  ad: "Advertisement",
  adSpace: "Space reserved for advertising",
  adNote: "Advertising supports our free tools.",
  calculate: "Calculate IBAN",
  calculateText:
    "Build an Italian IBAN from ABI, CAB and an account number, or use a known BBAN for another country.",
  calculateButton: "Calculate IBAN",
  abi: "ABI · bank code",
  cab: "CAB · branch code",
  account: "Account number",
  calculateNote:
    "Use details supplied by your bank. Calculation does not create an account or confirm that it exists.",
  inputError:
    "Enter 5 digits for ABI, 5 for CAB and up to 12 account letters or digits.",
  otherCountries: "Other countries · calculate from BBAN",
  rates: "Exchange rates",
  ratesText:
    "Explore European Central Bank reference rates, with the publication date clearly displayed.",
  converter: "Currency converter",
  converterText:
    "Convert between supported currencies using ECB reference rates.",
  codes: "Currency codes",
  codesText:
    "Browse the official ISO 4217 list of currencies, numeric codes and decimal places.",
  currencyGroup: "Currency tools",
  amount: "Amount",
  from: "From",
  to: "To",
  swap: "Swap currencies",
  converted: "Converted amount",
  asOf: "Reference date",
  fxNote:
    "Indicative reference rates, not live trading quotes. Your bank may apply different rates and fees.",
  loadError: "Rates are temporarily unavailable. Please try again.",
  retry: "Try again",
  loading: "Loading…",
  currency: "Currency",
  code: "Code",
  numeric: "Numeric code",
  digits: "Decimal places",
  searchCurrency: "Search a currency or code",
  searchBank: "Search by bank name, BIC or ABI",
  source: "Source",
  updated: "Retrieved",
  noResults: "No matching records.",
  bankScope:
    "The directory combines official bank registers and EPC participant records. Coverage varies by country; missing data is never guessed.",
  bankLoadError: "The bank directory is temporarily unavailable.",
  registryAddress: "Address in the participant register",
  legalOffice: "Registered office",
  branchAddress: "Branch address",
  branchUnknown:
    "A current address for this branch is not available in our verified dataset.",
  pec: "Certified email (PEC)",
  pecComplaint: "Certified email (PEC) · complaints",
  email: "Email",
  unknown: "Not available in the verified sources",
  schemes: "SEPA payment schemes",
  schemeYes: "Registered participant",
  schemeUnknown: "Participation not verified",
  schemeFuture: "Participation starts",
  schemeLeft: "Participation ended",
  schemeNote:
    "Bank-level participation from EPC records. It does not guarantee availability for this account or identify a payment-routing BIC.",
  dataSources: "Data sources & coverage",
  dataIntro:
    "Verified institutional data, with transparent coverage. This directory does not contain customer details.",
  dataLimit:
    "No single public source supplies every bank, branch and certified email worldwide. Unavailable fields remain explicitly marked.",
  curatedNote:
    "From a community-maintained bank-code list, not an official register. Confirm details with the bank.",
  vatId: "VAT no.",
  contactMissing:
    "Our public contact address will be published here when available. For account or payment assistance, contact your bank directly.",
};
type Copy = {
  [K in keyof typeof en]: (typeof en)[K] extends string[] ? string[] : string;
};
const it: Copy = {
  eyebrow: "Un po’ di chiarezza. Per ogni numero.",
  title: "I tuoi strumenti bancari.",
  accent: "Semplicemente chiari.",
  intro:
    "Verifica un IBAN, trova una banca, calcola un cambio. Risultati chiari, senza complicazioni.",
  tools: "Piccoli strumenti. Grande chiarezza.",
  toolsIntro: "Tutto ciò che serve, con la semplicità che cerchi.",
  explore: "Esplora tutti gli strumenti",
  contact: "Contatti",
  contactTitle: "Restiamo in contatto.",
  contactIntro:
    "Domande, suggerimenti o dati bancari da correggere? Ti ascoltiamo.",
  contactCta: "Contattaci",
  credit: "Sito creato da MAP Technologies",
  process: "Dai numeri alle risposte.",
  steps: [
    "Inserisci i dati",
    "Controlla il risultato",
    "Trova le informazioni",
  ],
  stepTexts: [
    "La verifica IBAN avviene sul tuo dispositivo. Senza registrazione.",
    "Paese, formato e cifre di controllo internazionali, spiegati con chiarezza.",
    "Identificativi, dati della banca con fonti e partecipazione SEPA.",
  ],
  ad: "Pubblicità",
  adSpace: "Spazio riservato alla pubblicità",
  adNote: "La pubblicità sostiene i nostri strumenti gratuiti.",
  calculate: "Calcola IBAN",
  calculateText:
    "Calcola un IBAN italiano da ABI, CAB e numero di conto, oppure usa un BBAN noto per un altro paese.",
  calculateButton: "Calcola IBAN",
  abi: "ABI · codice banca",
  cab: "CAB · codice filiale",
  account: "Numero di conto",
  calculateNote:
    "Usa i dati forniti dalla banca. Il calcolo non crea un conto e non ne conferma l’esistenza.",
  inputError:
    "Inserisci 5 cifre per ABI, 5 per CAB e fino a 12 lettere o cifre per il conto.",
  otherCountries: "Altri paesi · calcola da BBAN",
  rates: "Tassi di cambio",
  ratesText:
    "Consulta i cambi di riferimento della Banca centrale europea, con la data di pubblicazione sempre visibile.",
  converter: "Convertitore di valuta",
  converterText:
    "Converti gli importi tra le valute supportate con i tassi di riferimento BCE.",
  codes: "Codici valuta",
  codesText:
    "Esplora l’elenco ufficiale ISO 4217: valute, codici numerici e cifre decimali.",
  currencyGroup: "Strumenti valuta",
  amount: "Importo",
  from: "Da",
  to: "A",
  swap: "Inverti valute",
  converted: "Importo convertito",
  asOf: "Data di riferimento",
  fxNote:
    "Tassi indicativi di riferimento, non quotazioni in tempo reale. La tua banca può applicare cambi e commissioni diversi.",
  loadError: "Tassi temporaneamente non disponibili. Riprova tra poco.",
  retry: "Riprova",
  loading: "Caricamento…",
  currency: "Valuta",
  code: "Codice",
  numeric: "Codice numerico",
  digits: "Cifre decimali",
  searchCurrency: "Cerca una valuta o un codice",
  searchBank: "Cerca per nome della banca, BIC o ABI",
  source: "Fonte",
  updated: "Dati consultati il",
  noResults: "Nessun risultato.",
  bankScope:
    "Il repertorio unisce albi bancari ufficiali e registri dei partecipanti EPC. La copertura varia per paese; i dati mancanti non vengono inventati.",
  bankLoadError: "Il repertorio bancario è temporaneamente non disponibile.",
  registryAddress: "Indirizzo nel registro dei partecipanti",
  legalOffice: "Sede legale",
  branchAddress: "Indirizzo della filiale",
  branchUnknown:
    "L’indirizzo aggiornato di questa filiale non è disponibile nel nostro archivio verificato.",
  pec: "Posta elettronica certificata (PEC)",
  pecComplaint: "Posta elettronica certificata (PEC) · reclami",
  email: "Email",
  unknown: "Non disponibile nelle fonti verificate",
  schemes: "Servizi di pagamento SEPA",
  schemeYes: "Partecipante registrato",
  schemeUnknown: "Partecipazione non verificata",
  schemeFuture: "Partecipazione dal",
  schemeLeft: "Partecipazione terminata",
  schemeNote:
    "Partecipazione della banca secondo i registri EPC. Non garantisce il servizio per questo conto né identifica il BIC da usare per l’instradamento di un pagamento.",
  dataSources: "Fonti e copertura dei dati",
  dataIntro:
    "Dati istituzionali verificati e copertura trasparente. Il repertorio non contiene dati dei clienti.",
  dataLimit:
    "Non esiste un’unica fonte pubblica con tutte le banche, filiali e PEC del mondo. I campi non disponibili sono indicati esplicitamente.",
  curatedNote:
    "Da un elenco di codici bancari curato dalla comunità, non da un registro ufficiale. Verifica i dati con la banca.",
  vatId: "P.IVA",
  contactMissing:
    "L’indirizzo pubblico di contatto sarà pubblicato qui appena disponibile. Per assistenza su conti o pagamenti, rivolgiti direttamente alla tua banca.",
};
const de: Copy = {
  ...en,
  eyebrow: "Klarheit. Für jede Zahl.",
  title: "Ihre Bankwerkzeuge.",
  accent: "Einfach verständlich.",
  intro:
    "IBAN prüfen, eine Bank finden oder Währungen umrechnen. Klare Ergebnisse, einfach erklärt.",
  tools: "Kleine Werkzeuge. Große Klarheit.",
  toolsIntro: "Alles, was Sie brauchen. Ohne Umwege.",
  explore: "Alle Werkzeuge",
  contact: "Kontakt",
  contactTitle: "Bleiben wir in Kontakt.",
  contactIntro:
    "Fragen, Anregungen oder eine Korrektur zu Bankdaten? Wir hören zu.",
  contactCta: "Kontakt aufnehmen",
  credit: "Website erstellt von MAP Technologies",
  process: "Von Zahlen zu Antworten.",
  steps: ["Daten eingeben", "Ergebnis prüfen", "Informationen finden"],
  stepTexts: [
    "IBAN-Prüfungen laufen auf Ihrem Gerät. Ohne Anmeldung.",
    "Land, Format und internationale Prüfziffern verständlich erklärt.",
    "Bankkennungen, belegte Bankdaten und SEPA-Teilnahme.",
  ],
  ad: "Werbung",
  adSpace: "Reservierter Werbeplatz",
  adNote: "Werbung unterstützt unsere kostenlosen Werkzeuge.",
  calculate: "IBAN berechnen",
  calculateText:
    "Italienische IBAN aus ABI, CAB und Kontonummer berechnen oder eine bekannte BBAN verwenden.",
  calculateButton: "IBAN berechnen",
  abi: "ABI · Bankcode",
  cab: "CAB · Filialcode",
  account: "Kontonummer",
  calculateNote:
    "Verwenden Sie Angaben Ihrer Bank. Die Berechnung eröffnet kein Konto und bestätigt nicht dessen Existenz.",
  inputError:
    "ABI und CAB müssen je 5 Ziffern enthalten; die Kontonummer maximal 12 Buchstaben oder Ziffern.",
  otherCountries: "Andere Länder · aus BBAN berechnen",
  rates: "Wechselkurse",
  ratesText:
    "Referenzkurse der Europäischen Zentralbank mit Veröffentlichungsdatum.",
  converter: "Währungsrechner",
  converterText:
    "Beträge mit EZB-Referenzkursen in unterstützte Währungen umrechnen.",
  codes: "Währungscodes",
  codesText:
    "Offizielle ISO-4217-Liste mit Währungen, numerischen Codes und Nachkommastellen.",
  currencyGroup: "Währungswerkzeuge",
  amount: "Betrag",
  from: "Von",
  to: "Nach",
  swap: "Währungen tauschen",
  converted: "Umgerechneter Betrag",
  asOf: "Referenzdatum",
  fxNote:
    "Unverbindliche Referenzkurse, keine Echtzeit-Handelskurse. Bankkurse und Gebühren können abweichen.",
  loadError: "Kurse vorübergehend nicht verfügbar. Bitte erneut versuchen.",
  retry: "Erneut versuchen",
  loading: "Laden…",
  currency: "Währung",
  code: "Code",
  numeric: "Numerischer Code",
  digits: "Nachkommastellen",
  searchCurrency: "Währung oder Code suchen",
  searchBank: "Bankname, BIC oder ABI suchen",
  source: "Quelle",
  updated: "Abgerufen am",
  noResults: "Keine passenden Einträge.",
  bankScope:
    "Offizielle Bankenregister und EPC-Teilnehmerdaten. Die Abdeckung variiert je Land; fehlende Angaben werden nicht geschätzt.",
  bankLoadError: "Bankverzeichnis vorübergehend nicht verfügbar.",
  registryAddress: "Adresse im Teilnehmerregister",
  legalOffice: "Eingetragener Sitz",
  branchAddress: "Filialadresse",
  branchUnknown:
    "Keine verifizierte aktuelle Adresse für diese Filiale verfügbar.",
  pec: "Zertifizierte E-Mail (PEC)",
  pecComplaint: "Zertifizierte E-Mail (PEC) · Beschwerden",
  unknown: "In den verifizierten Quellen nicht verfügbar",
  schemes: "SEPA-Zahlungsverfahren",
  schemeYes: "Registrierter Teilnehmer",
  schemeUnknown: "Teilnahme nicht bestätigt",
  schemeFuture: "Teilnahme ab",
  schemeLeft: "Teilnahme beendet",
  schemeNote:
    "Teilnahme der Bank laut EPC. Keine Garantie für dieses Konto; kein Nachweis einer Zahlungsrouting-BIC.",
  dataSources: "Datenquellen und Abdeckung",
  dataIntro:
    "Verifizierte institutionelle Daten mit transparenter Abdeckung. Keine Kundendaten.",
  dataLimit:
    "Keine einzelne öffentliche Quelle enthält alle Banken, Filialen und PEC-Adressen weltweit.",
  curatedNote:
    "Aus einer von der Community gepflegten Bankleitzahlenliste, nicht aus einem amtlichen Register. Bitte Angaben bei der Bank prüfen.",
  vatId: "USt-IdNr.",
  contactMissing:
    "Unsere Kontaktadresse wird hier veröffentlicht, sobald sie verfügbar ist. Für Kontofragen wenden Sie sich an Ihre Bank.",
};
const es: Copy = {
  ...en,
  eyebrow: "Claridad. Para cada número.",
  title: "Tus herramientas bancarias.",
  accent: "Simplemente claras.",
  intro:
    "Verifica un IBAN, encuentra un banco o convierte divisas. Resultados claros, sin complicaciones.",
  tools: "Pequeñas herramientas. Gran claridad.",
  toolsIntro: "Todo lo que necesitas, de forma sencilla.",
  explore: "Todas las herramientas",
  contact: "Contacto",
  contactTitle: "Sigamos en contacto.",
  contactIntro:
    "¿Preguntas, sugerencias o datos bancarios que corregir? Te escuchamos.",
  contactCta: "Contáctanos",
  credit: "Sitio creado por MAP Technologies",
  process: "De números a respuestas.",
  steps: [
    "Introduce los datos",
    "Revisa el resultado",
    "Encuentra información",
  ],
  stepTexts: [
    "La validación se ejecuta en tu dispositivo. Sin registro.",
    "País, formato y dígitos de control internacionales claramente explicados.",
    "Identificadores, datos bancarios con fuentes y participación SEPA.",
  ],
  ad: "Publicidad",
  adSpace: "Espacio reservado para publicidad",
  adNote: "La publicidad apoya nuestras herramientas gratuitas.",
  calculate: "Calcular IBAN",
  calculateText:
    "Calcula un IBAN italiano con ABI, CAB y número de cuenta o utiliza un BBAN conocido.",
  calculateButton: "Calcular IBAN",
  abi: "ABI · código bancario",
  cab: "CAB · código de sucursal",
  account: "Número de cuenta",
  calculateNote:
    "Utiliza datos facilitados por tu banco. El cálculo no crea una cuenta ni confirma su existencia.",
  inputError:
    "Introduce 5 dígitos para ABI y CAB y hasta 12 letras o dígitos para la cuenta.",
  otherCountries: "Otros países · calcular desde BBAN",
  rates: "Tipos de cambio",
  ratesText:
    "Consulta los tipos de referencia del Banco Central Europeo con su fecha de publicación.",
  converter: "Conversor de divisas",
  converterText:
    "Convierte importes entre divisas admitidas con tipos de referencia del BCE.",
  codes: "Códigos de moneda",
  codesText:
    "Lista oficial ISO 4217 con monedas, códigos numéricos y decimales.",
  currencyGroup: "Herramientas de divisas",
  amount: "Importe",
  from: "De",
  to: "A",
  swap: "Invertir divisas",
  converted: "Importe convertido",
  asOf: "Fecha de referencia",
  fxNote:
    "Tipos de referencia indicativos, no cotizaciones en tiempo real. Tu banco puede aplicar otros tipos y comisiones.",
  loadError: "Tipos temporalmente no disponibles. Inténtalo de nuevo.",
  retry: "Reintentar",
  loading: "Cargando…",
  currency: "Moneda",
  code: "Código",
  numeric: "Código numérico",
  digits: "Decimales",
  searchCurrency: "Buscar moneda o código",
  searchBank: "Buscar banco, BIC o ABI",
  source: "Fuente",
  updated: "Consultado el",
  noResults: "Sin resultados.",
  bankScope:
    "Registros bancarios oficiales y participantes EPC. La cobertura varía por país; nunca se inventan datos.",
  bankLoadError: "Directorio temporalmente no disponible.",
  registryAddress: "Dirección en el registro de participantes",
  legalOffice: "Domicilio social",
  branchAddress: "Dirección de la sucursal",
  branchUnknown: "No hay una dirección actual verificada para esta sucursal.",
  pec: "Correo certificado (PEC)",
  pecComplaint: "Correo certificado (PEC) · reclamaciones",
  unknown: "No disponible en las fuentes verificadas",
  schemes: "Esquemas de pago SEPA",
  schemeYes: "Participante registrado",
  schemeUnknown: "Participación no verificada",
  schemeFuture: "Participación desde",
  schemeLeft: "Participación finalizada",
  schemeNote:
    "Participación del banco según EPC. No garantiza el servicio para esta cuenta ni identifica un BIC de enrutamiento.",
  dataSources: "Fuentes y cobertura",
  dataIntro:
    "Datos institucionales verificados con cobertura transparente. No contiene datos de clientes.",
  dataLimit:
    "Ninguna fuente pública contiene todos los bancos, sucursales y correos certificados del mundo.",
  curatedNote:
    "De una lista de códigos bancarios mantenida por la comunidad, no de un registro oficial. Confirma los datos con el banco.",
  vatId: "NIF-IVA",
  contactMissing:
    "Publicaremos aquí nuestro correo de contacto cuando esté disponible. Para consultas sobre cuentas, contacta con tu banco.",
};
const fr: Copy = {
  ...en,
  eyebrow: "De la clarté. Pour chaque nombre.",
  title: "Vos outils bancaires.",
  accent: "Tout simplement clairs.",
  intro:
    "Vérifiez un IBAN, trouvez une banque ou convertissez des devises. Des résultats clairs, sans complications.",
  tools: "Petits outils. Grande clarté.",
  toolsIntro: "Tout ce dont vous avez besoin, simplement.",
  explore: "Tous les outils",
  contact: "Contact",
  contactTitle: "Restons en contact.",
  contactIntro:
    "Questions, suggestions ou données bancaires à corriger ? Nous vous écoutons.",
  contactCta: "Nous contacter",
  credit: "Site créé par MAP Technologies",
  process: "Des nombres aux réponses.",
  steps: [
    "Saisissez les données",
    "Vérifiez le résultat",
    "Trouvez les informations",
  ],
  stepTexts: [
    "La validation fonctionne sur votre appareil. Sans inscription.",
    "Pays, format et clé de contrôle internationale clairement expliqués.",
    "Identifiants, données bancaires sourcées et participation SEPA.",
  ],
  ad: "Publicité",
  adSpace: "Espace réservé à la publicité",
  adNote: "La publicité soutient nos outils gratuits.",
  calculate: "Calculer un IBAN",
  calculateText:
    "Calculez un IBAN italien à partir des codes ABI, CAB et du numéro de compte, ou utilisez un BBAN connu.",
  calculateButton: "Calculer un IBAN",
  abi: "ABI · code banque",
  cab: "CAB · code agence",
  account: "Numéro de compte",
  calculateNote:
    "Utilisez les données fournies par votre banque. Le calcul ne crée pas de compte et ne confirme pas son existence.",
  inputError:
    "Saisissez 5 chiffres pour ABI et CAB, et jusqu’à 12 lettres ou chiffres pour le compte.",
  otherCountries: "Autres pays · calculer à partir du BBAN",
  rates: "Taux de change",
  ratesText:
    "Consultez les taux de référence de la Banque centrale européenne avec leur date de publication.",
  converter: "Convertisseur de devises",
  converterText:
    "Convertissez les montants entre devises prises en charge avec les taux de référence BCE.",
  codes: "Codes des devises",
  codesText:
    "Liste officielle ISO 4217 : devises, codes numériques et décimales.",
  currencyGroup: "Outils de devises",
  amount: "Montant",
  from: "De",
  to: "Vers",
  swap: "Inverser les devises",
  converted: "Montant converti",
  asOf: "Date de référence",
  fxNote:
    "Taux indicatifs de référence, pas de cotations en temps réel. Votre banque peut appliquer d’autres taux et frais.",
  loadError: "Taux temporairement indisponibles. Veuillez réessayer.",
  retry: "Réessayer",
  loading: "Chargement…",
  currency: "Devise",
  code: "Code",
  numeric: "Code numérique",
  digits: "Décimales",
  searchCurrency: "Rechercher une devise ou un code",
  searchBank: "Rechercher une banque, un BIC ou un ABI",
  source: "Source",
  updated: "Consulté le",
  noResults: "Aucun résultat.",
  bankScope:
    "Registres bancaires officiels et participants EPC. La couverture varie selon le pays ; les données manquantes ne sont pas inventées.",
  bankLoadError: "Répertoire bancaire temporairement indisponible.",
  registryAddress: "Adresse dans le registre des participants",
  legalOffice: "Siège social",
  branchAddress: "Adresse de l’agence",
  branchUnknown: "Aucune adresse actuelle vérifiée pour cette agence.",
  pec: "Courriel certifié (PEC)",
  pecComplaint: "Courriel certifié (PEC) · réclamations",
  unknown: "Non disponible dans les sources vérifiées",
  schemes: "Schémas de paiement SEPA",
  schemeYes: "Participant enregistré",
  schemeUnknown: "Participation non vérifiée",
  schemeFuture: "Participation à partir du",
  schemeLeft: "Participation terminée",
  schemeNote:
    "Participation de la banque selon EPC. Ne garantit pas le service pour ce compte ni un BIC de routage de paiement.",
  dataSources: "Sources et couverture",
  dataIntro:
    "Données institutionnelles vérifiées et couverture transparente. Aucune donnée client.",
  dataLimit:
    "Aucune source publique unique ne contient toutes les banques, agences et adresses certifiées du monde.",
  curatedNote:
    "Issu d’une liste de codes bancaires maintenue par la communauté, et non d’un registre officiel. Vérifiez auprès de la banque.",
  vatId: "N° TVA",
  contactMissing:
    "Notre adresse de contact sera publiée ici dès qu’elle sera disponible. Pour votre compte, contactez directement votre banque.",
};
export const productCopy: Record<Locale, Copy> = { en, it, de, es, fr };
