import { toolCatalog } from "./tools";
import type { Locale } from "./i18n";

const translations: Record<Exclude<Locale, "en">, [string, string][]> = {
  it: [
    ["Validatore IBAN", "Verifica formato nazionale, lunghezza e cifre di controllo, in privato nel browser."],
    ["Analizzatore IBAN", "Comprendi paese, cifre di controllo e identificativi nazionali, con dati bancari verificati quando disponibili."],
    ["Formattatore IBAN", "Elimina gli spazi, converti le lettere in maiuscolo e copia il formato leggibile o elettronico."],
    ["Generatore IBAN", "Calcola le cifre di controllo da un BBAN fornito dalla banca. Non crea un conto bancario."],
    ["Verifica paese IBAN", "Scopri lunghezza nazionale, struttura BBAN e copertura geografica SEPA dal codice del paese."],
    ["Ricerca BIC / SWIFT", "Cerca banche con fonti verificate e controlla il formato di un BIC, senza informazioni inventate."],
    ["Identificativo della banca", "Estrai il codice bancario dalla posizione prevista per il paese. Il codice richiede una verifica separata del nome della banca."],
    ["Ricerca ABI / CAB", "Estrai i codici ABI della banca e CAB della filiale, di cinque cifre ciascuno, da un IBAN italiano."],
    ["Verifica SEPA", "Controlla la copertura geografica SEPA. La partecipazione della singola banca va verificata separatamente."],
    ["Validazione IBAN multipla", "Verifica fino a 100 IBAN sul tuo dispositivo ed esporta un report per il foglio di calcolo."],
    ["Validatore IBAN da CSV", "Apri un CSV sul dispositivo, verifica la colonna IBAN e scarica i risultati. Il file non viene caricato online."],
  ],
  de: [
    ["IBAN-Prüfung", "Prüfen Sie Länderformat, Länge und internationale Prüfziffern direkt und privat im Browser."],
    ["IBAN-Analyse", "Verstehen Sie Land, Prüfziffern und nationale Kennungen mit verifizierten Bankdaten, soweit verfügbar."],
    ["IBAN-Formatierung", "Entfernen Sie Leerzeichen, verwenden Sie Großbuchstaben und kopieren Sie das Druck- oder elektronische Format."],
    ["IBAN-Generator", "Berechnen Sie internationale Prüfziffern aus einer von der Bank bereitgestellten BBAN. Es wird kein Konto eröffnet."],
    ["IBAN-Länderprüfung", "Ermitteln Sie nationale Länge, BBAN-Struktur und geografische SEPA-Abdeckung anhand des Ländercodes."],
    ["BIC / SWIFT-Suche", "Durchsuchen Sie belegte Bankdaten und prüfen Sie das BIC-Format. Unbekannte Angaben werden nicht erfunden."],
    ["Bankkennung ermitteln", "Lesen Sie die Bankkennung aus ihrer nationalen Position. Der Bankname erfordert einen gesonderten Abgleich."],
    ["ABI / CAB-Suche", "Lesen Sie die jeweils fünfstelligen italienischen Bank- und Filialkennungen ABI und CAB aus einer IBAN."],
    ["SEPA-Prüfung", "Prüfen Sie den geografischen SEPA-Geltungsbereich. Die Teilnahme einer Bank muss separat geprüft werden."],
    ["IBAN-Stapelprüfung", "Prüfen Sie bis zu 100 IBANs lokal auf Ihrem Gerät und exportieren Sie einen Bericht für Tabellenprogramme."],
    ["IBAN-Prüfung aus CSV", "Öffnen Sie eine CSV lokal, prüfen Sie die IBAN-Spalte und laden Sie die Ergebnisse herunter. Kein Datei-Upload."],
  ],
  es: [
    ["Validador de IBAN", "Comprueba el formato nacional, la longitud y los dígitos de control en privado desde el navegador."],
    ["Analizador de IBAN", "Comprende el país, los dígitos de control y los identificadores nacionales, con datos bancarios verificados cuando existan."],
    ["Formateador de IBAN", "Elimina espacios, convierte las letras a mayúsculas y copia el formato legible o electrónico."],
    ["Generador de IBAN", "Calcula los dígitos de control a partir de un BBAN facilitado por el banco. No crea cuentas bancarias."],
    ["Verificador de país IBAN", "Consulta la longitud nacional, la estructura BBAN y la cobertura geográfica SEPA por código de país."],
    ["Buscador BIC / SWIFT", "Busca datos bancarios con fuentes verificadas y comprueba el formato de un BIC, sin inventar información."],
    ["Identificador bancario", "Extrae el código bancario de su posición nacional. El nombre del banco requiere una comprobación independiente."],
    ["Buscador ABI / CAB", "Extrae los códigos italianos ABI del banco y CAB de la sucursal, de cinco dígitos cada uno."],
    ["Verificador SEPA", "Comprueba el ámbito geográfico SEPA. La participación del banco debe verificarse por separado."],
    ["Validación múltiple de IBAN", "Valida hasta 100 IBAN en tu dispositivo y exporta un informe para hojas de cálculo."],
    ["Validador IBAN desde CSV", "Abre un CSV localmente, valida su columna IBAN y descarga los resultados. El archivo nunca se sube."],
  ],
  fr: [
    ["Validateur IBAN", "Vérifiez le format national, la longueur et les chiffres de contrôle en toute confidentialité dans le navigateur."],
    ["Analyseur IBAN", "Comprenez le pays, la clé de contrôle et les identifiants nationaux, avec des données bancaires vérifiées lorsqu’elles existent."],
    ["Formatage IBAN", "Supprimez les espaces, convertissez les lettres en majuscules et copiez le format lisible ou électronique."],
    ["Générateur IBAN", "Calculez les chiffres de contrôle à partir d’un BBAN fourni par la banque. Aucun compte n’est créé."],
    ["Vérification du pays IBAN", "Consultez la longueur nationale, la structure BBAN et la couverture géographique SEPA par code de pays."],
    ["Recherche BIC / SWIFT", "Recherchez des données bancaires sourcées et vérifiez le format d’un BIC, sans inventer les informations manquantes."],
    ["Identifiant bancaire", "Extrayez le code bancaire de sa position nationale. Le nom de la banque nécessite un rapprochement distinct."],
    ["Recherche ABI / CAB", "Extrayez les codes italiens ABI de la banque et CAB de l’agence, composés chacun de cinq chiffres."],
    ["Vérification SEPA", "Vérifiez le périmètre géographique SEPA. La participation d’une banque doit être confirmée séparément."],
    ["Validation IBAN par lot", "Vérifiez jusqu’à 100 IBAN sur votre appareil et exportez un rapport pour votre tableur."],
    ["Validation IBAN depuis CSV", "Ouvrez un CSV localement, vérifiez sa colonne IBAN et téléchargez les résultats. Le fichier n’est jamais envoyé."],
  ],
};

export function getLocalizedTools(locale: Locale) {
  if (locale === "en") return toolCatalog;
  return toolCatalog.map((tool, index) => ({ ...tool, name: translations[locale][index][0], description: translations[locale][index][1], detail: translations[locale][index][1] }));
}

export function toolGroupName(group: string, locale: Locale) {
  const groups = { en: ["IBAN tools", "Banking tools", "Business tools"], it: ["Strumenti IBAN", "Strumenti bancari", "Strumenti aziendali"], de: ["IBAN-Werkzeuge", "Bankwerkzeuge", "Unternehmenswerkzeuge"], es: ["Herramientas IBAN", "Herramientas bancarias", "Herramientas empresariales"], fr: ["Outils IBAN", "Outils bancaires", "Outils professionnels"] };
  return groups[locale][groups.en.indexOf(group)] ?? group;
}
