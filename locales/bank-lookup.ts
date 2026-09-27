import type { Locale } from "@/lib/i18n";
export const bankLookupCopy: Record<
  Locale,
  {
    loading: string;
    error: string;
    missing: string;
    invalid: string;
    retry: string;
    coverage: string;
  }
> = {
  en: {
    loading: "Loading verified bank details…",
    error:
      "Bank details could not be loaded. The IBAN validation is still available.",
    missing:
      "No verified bank match for this country and bank code. Format examples can contain historical codes.",
    invalid: "Correct the IBAN before looking up its bank.",
    retry: "Retry bank lookup",
    coverage: "View data coverage",
  },
  it: {
    loading: "Caricamento dei dati bancari verificati…",
    error:
      "Non è stato possibile caricare i dettagli della banca. La verifica IBAN resta disponibile.",
    missing:
      "Nessuna banca verificata per questo paese e codice banca. Gli esempi di formato possono contenere codici storici.",
    invalid: "Correggi l’IBAN per cercare la banca.",
    retry: "Riprova ricerca banca",
    coverage: "Consulta la copertura dei dati",
  },
  de: {
    loading: "Verifizierte Bankdaten werden geladen…",
    error:
      "Die Bankdetails konnten nicht geladen werden. Die IBAN-Prüfung bleibt verfügbar.",
    missing:
      "Kein verifizierter Banktreffer für dieses Land und diese Bankkennung. Formatbeispiele können historische Kennungen enthalten.",
    invalid: "Korrigieren Sie die IBAN vor der Banksuche.",
    retry: "Banksuche wiederholen",
    coverage: "Datenabdeckung ansehen",
  },
  es: {
    loading: "Cargando datos bancarios verificados…",
    error:
      "No se pudieron cargar los detalles del banco. La validación IBAN sigue disponible.",
    missing:
      "No hay un banco verificado para este país y código. Los ejemplos de formato pueden contener códigos históricos.",
    invalid: "Corrige el IBAN antes de buscar el banco.",
    retry: "Reintentar búsqueda bancaria",
    coverage: "Ver cobertura de datos",
  },
  fr: {
    loading: "Chargement des données bancaires vérifiées…",
    error:
      "Les détails bancaires n’ont pas pu être chargés. La validation IBAN reste disponible.",
    missing:
      "Aucune banque vérifiée pour ce pays et cet identifiant. Les exemples de format peuvent contenir des codes historiques.",
    invalid: "Corrigez l’IBAN avant de rechercher la banque.",
    retry: "Réessayer la recherche bancaire",
    coverage: "Voir la couverture des données",
  },
};
