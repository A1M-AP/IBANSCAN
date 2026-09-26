/** Shared entitlements; billing and identity providers can resolve a plan later. */
export type PlanId = "free" | "pro" | "business";

export const plans = {
  free: { bulkRows: 100, aiPerDay: 10, apiPerMinute: 30, advertising: true, history: false },
  pro: { bulkRows: 5_000, aiPerDay: 100, apiPerMinute: 120, advertising: false, history: true },
  business: { bulkRows: 50_000, aiPerDay: 1_000, apiPerMinute: 600, advertising: false, history: true },
} as const satisfies Record<PlanId, { bulkRows: number; aiPerDay: number; apiPerMinute: number; advertising: boolean; history: boolean }>;

export const FREE_BULK_LIMIT = plans.free.bulkRows;

