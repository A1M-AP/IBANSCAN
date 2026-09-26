import type { BankRecord } from "./banks";
export type Scheme = { ready: string; leaving: string; source: string };
export type DirectoryBank = BankRecord & {
  registryAddress?: string;
  registrySource?: string;
  registryDate?: string;
  headquartersAddress?: string;
  headquartersSource?: string;
  headquartersDate?: string;
  pec?: { email: string; purpose: string; source: string; verifiedAt: string };
  schemes?: Partial<
    Record<"sct" | "sct_inst" | "sdd_core" | "sdd_b2b", Scheme>
  >;
  schemeDate?: string;
  branches?: { id: string; address: string }[];
  branchCount?: number;
  branchSource?: string;
  branchDate?: string;
};
export function schemeState(
  scheme: Scheme | undefined,
  today = new Date().toISOString().slice(0, 10),
): "unknown" | "active" | "future" | "ended" {
  if (!scheme || !/^\d{4}-\d{2}-\d{2}$/.test(scheme.ready)) return "unknown";
  if (scheme.leaving && scheme.leaving <= today) return "ended";
  if (scheme.ready > today) return "future";
  return "active";
}
