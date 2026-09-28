import { calculateItalianIban } from "./iban-calculator";
import { generateIban } from "./iban";
/** Synthetic demonstration accounts using separately verified bank identifiers.
 * These examples demonstrate structure; they do not represent usable accounts.
 * Official SWIFT format examples remain unchanged in the country registry.
 */
export const scannerExamples: Record<string, string> = {
  IT: calculateItalianIban("02008", "21703", "000000000001"),
  DE: generateIban("DE", "100110010000000001"),
  GB: generateIban("GB", "NWBK60161300000001"),
};
