import type { Locale } from "@/lib/i18n";
export const toolFeedback: Record<Locale, { demo: string; amount: string }> = {
  en: {
    demo: "Examples use synthetic account numbers. They demonstrate validation and bank lookup; they are not payment details.",
    amount:
      "Enter an amount from 0 to 1,000,000,000,000, using a comma or dot for decimals and no thousands separators.",
  },
  it: {
    demo: "Gli esempi usano numeri di conto fittizi. Mostrano verifica e ricerca della banca; non sono coordinate per pagamenti.",
    amount:
      "Inserisci un importo tra 0 e 1.000.000.000.000, con virgola o punto per i decimali e senza separatori delle migliaia.",
  },
  de: {
    demo: "Die Beispiele verwenden fiktive Kontonummern. Sie zeigen Prüfung und Banksuche und sind keine Zahlungsdaten.",
    amount:
      "Geben Sie einen Betrag von 0 bis 1.000.000.000.000 ein, mit Komma oder Punkt für Dezimalstellen und ohne Tausendertrennzeichen.",
  },
  es: {
    demo: "Los ejemplos usan números de cuenta ficticios. Demuestran la validación y la búsqueda bancaria; no son datos para pagos.",
    amount:
      "Introduce un importe entre 0 y 1.000.000.000.000, con coma o punto decimal y sin separadores de miles.",
  },
  fr: {
    demo: "Les exemples utilisent des numéros de compte fictifs. Ils illustrent la validation et la recherche bancaire, sans servir aux paiements.",
    amount:
      "Saisissez un montant de 0 à 1 000 000 000 000, avec une virgule ou un point décimal, sans séparateur de milliers.",
  },
};
