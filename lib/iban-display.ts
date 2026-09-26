import type { IbanResult } from "./iban";
import type { Locale } from "./i18n";

export function countryName(code: string, locale: Locale, fallback = code): string {
  try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) || fallback; }
  catch { return fallback; }
}

const messages = {
  it: {
    labels: ["Formato dei caratteri", "Paese supportato", "Lunghezza IBAN", "Struttura BBAN", "Cifre di controllo", "Dati inseriti"],
    characters: ["Due lettere per il paese, due cifre di controllo e caratteri alfanumerici.", "Usa due lettere per il paese, due cifre di controllo, poi lettere o numeri. Gli spazi sono ammessi, la punteggiatura no."],
    country: ["{country} ({code}) ha un formato IBAN registrato.", "Formato del paese non supportato. Controlla le prime due lettere."],
    length: ["Esattamente {length} caratteri, come previsto per {country}.", "{country} richiede {length} caratteri; ne hai inseriti {actual}.", "La lunghezza non può essere verificata senza un paese supportato."],
    structure: ["Lettere e cifre corrispondono al formato nazionale registrato.", "Le lettere e le cifre non rispettano il formato BBAN del paese.", "La struttura BBAN non può essere verificata senza un paese supportato."],
    checksum: ["Il checksum internazionale MOD-97 è corretto.", "Le cifre di controllo internazionali sono errate o non verificabili. Conferma l’IBAN completo con la fonte."],
    input: "Inserisci un solo IBAN con un massimo di 256 caratteri.",
  },
  de: {
    labels: ["Zeichenformat", "Unterstütztes Land", "IBAN-Länge", "BBAN-Struktur", "Prüfziffern", "Eingabe"],
    characters: ["Zwei Länderbuchstaben, zwei Prüfziffern und alphanumerische Zeichen.", "Verwenden Sie zwei Länderbuchstaben, zwei Prüfziffern, dann Buchstaben oder Zahlen. Leerzeichen sind erlaubt, Satzzeichen nicht."],
    country: ["{country} ({code}) hat ein registriertes IBAN-Format.", "Dieses Länderformat wird nicht unterstützt. Prüfen Sie die ersten zwei Buchstaben."],
    length: ["Genau {length} Zeichen, wie für {country} erforderlich.", "{country} erfordert {length} Zeichen; die Eingabe enthält {actual}.", "Die Länge kann ohne unterstütztes Land nicht geprüft werden."],
    structure: ["Buchstaben und Ziffern entsprechen dem registrierten nationalen Format.", "Buchstaben und Ziffern entsprechen nicht dem BBAN-Format dieses Landes.", "Die BBAN-Struktur kann ohne unterstütztes Land nicht geprüft werden."],
    checksum: ["Die internationale MOD-97-Prüfsumme ist korrekt.", "Die internationalen Prüfziffern sind falsch oder nicht prüfbar. Bestätigen Sie die vollständige IBAN bei der Quelle."],
    input: "Geben Sie eine einzelne IBAN mit höchstens 256 Eingabezeichen ein.",
  },
  es: {
    labels: ["Formato de caracteres", "País admitido", "Longitud del IBAN", "Estructura BBAN", "Dígitos de control", "Entrada"],
    characters: ["Dos letras de país, dos dígitos de control y caracteres alfanuméricos.", "Usa dos letras de país, dos dígitos de control y después letras o números. Se permiten espacios, pero no puntuación."],
    country: ["{country} ({code}) tiene un formato IBAN registrado.", "Este formato de país no está admitido. Comprueba las dos primeras letras."],
    length: ["Exactamente {length} caracteres, como requiere {country}.", "{country} requiere {length} caracteres; la entrada contiene {actual}.", "No se puede comprobar la longitud sin un país admitido."],
    structure: ["Las letras y los números coinciden con el formato nacional registrado.", "Las letras y los números no coinciden con el formato BBAN de este país.", "No se puede comprobar la estructura BBAN sin un país admitido."],
    checksum: ["La suma de control internacional MOD-97 es correcta.", "Los dígitos de control internacionales son incorrectos o no se pueden comprobar. Confirma el IBAN completo con su fuente."],
    input: "Introduce un solo IBAN con un máximo de 256 caracteres.",
  },
  fr: {
    labels: ["Format des caractères", "Pays pris en charge", "Longueur de l’IBAN", "Structure BBAN", "Clé de contrôle", "Saisie"],
    characters: ["Deux lettres de pays, deux chiffres de contrôle et des caractères alphanumériques.", "Utilisez deux lettres de pays, deux chiffres de contrôle, puis des lettres ou des chiffres. Les espaces sont admis, pas la ponctuation."],
    country: ["{country} ({code}) possède un format IBAN enregistré.", "Ce format de pays n’est pas pris en charge. Vérifiez les deux premières lettres."],
    length: ["Exactement {length} caractères, comme requis pour {country}.", "{country} exige {length} caractères ; la saisie en contient {actual}.", "La longueur ne peut être vérifiée sans un pays pris en charge."],
    structure: ["Les lettres et les chiffres correspondent au format national enregistré.", "Les lettres et les chiffres ne correspondent pas au format BBAN de ce pays.", "La structure BBAN ne peut être vérifiée sans un pays pris en charge."],
    checksum: ["La somme de contrôle internationale MOD-97 est correcte.", "Les chiffres de contrôle internationaux sont incorrects ou invérifiables. Confirmez l’IBAN complet auprès de sa source."],
    input: "Saisissez un seul IBAN de 256 caractères maximum.",
  },
};

/** Presentation only: never modifies the validation result or public API contract. */
export function localizeResult(result: IbanResult, locale: Locale): IbanResult {
  const country = result.country ? { ...result.country, name: countryName(result.country.code, locale, result.country.name) } : null;
  if (locale === "en") return { ...result, country };
  const t = messages[locale];
  const fields: Record<string, string | number> = { country: country?.name ?? "", code: country?.code ?? "", length: country?.length ?? "", actual: result.normalized.length };
  const checks = result.checks.map(check => {
    const ids = ["characters", "country", "length", "structure", "checksum", "input"];
    const index = ids.indexOf(check.id);
    if (index < 0) return check;
    let message: string;
    if (check.id === "input") message = t.input;
    else {
      const key = check.id as "characters" | "country" | "length" | "structure" | "checksum";
      const options = t[key];
      message = options[(key === "length" || key === "structure") && !country ? 2 : check.passed ? 0 : 1];
    }
    return { ...check, label: t.labels[index], message: message.replace(/\{(\w+)\}/g, (_, key: string) => String(fields[key] ?? "")) };
  });
  return { ...result, country, checks, errors: checks.filter(check => !check.passed).map(check => check.message) };
}
