/**
 * Public identity of whoever runs this deployment. Every value is a public build-time
 * variable (Next.js inlines NEXT_PUBLIC_* literally, so keep the property accesses explicit).
 * Nothing is invented: until name, address and contact email are set, legal pages stay drafts.
 */
export type Operator = {
  name: string;
  address: string;
  email: string;
  vatId?: string;
  pec?: string;
  hosting?: string;
};

const emailPattern = /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/;

const clean = (value: string | undefined, max = 200) => {
  const text = value?.replace(/\s+/g, " ").trim();
  return text && text.length <= max && !/[<>]/.test(text) ? text : undefined;
};

export function contactEmail(value = process.env.NEXT_PUBLIC_CONTACT_EMAIL): string | null {
  const email = value?.trim();
  return email && emailPattern.test(email) ? email : null;
}

export function operatorDetails(
  env: Record<string, string | undefined> = {
    name: process.env.NEXT_PUBLIC_OPERATOR_NAME,
    address: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    vatId: process.env.NEXT_PUBLIC_OPERATOR_VAT_ID,
    pec: process.env.NEXT_PUBLIC_OPERATOR_PEC,
    hosting: process.env.NEXT_PUBLIC_HOSTING_PROVIDER,
  },
): Operator | null {
  const name = clean(env.name);
  const address = clean(env.address, 300);
  const email = contactEmail(env.email);
  if (!name || !address || !email) return null;
  const pec = env.pec?.trim();
  return {
    name,
    address,
    email,
    vatId: clean(env.vatId, 40),
    pec: pec && emailPattern.test(pec) ? pec : undefined,
    hosting: clean(env.hosting),
  };
}
