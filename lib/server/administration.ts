import "server-only";
import type { PlanId } from "@/lib/plans";

/** Adapter boundaries for a future authenticated dashboard. No public admin route exists. */
export interface VerifiedSession {
  subject: string;
  organizationId: string;
}

export interface IdentityProvider {
  /** Must verify a signed, expiring, secure session on the server. Never trust a role header. */
  authenticate(request: Request): Promise<VerifiedSession | null>;
  authorizeAdmin(session: VerifiedSession, permission: "content" | "data" | "configuration"): Promise<boolean>;
}

export interface SubscriptionProvider {
  /** Plan is resolved from verified server-side billing state, never a client field. */
  activePlan(organizationId: string): Promise<PlanId>;
  /** Future Stripe adapter must validate signatures and deduplicate event IDs first. */
  applyVerifiedEvent(eventId: string, organizationId: string): Promise<void>;
}

export interface UsageRepository {
  /** Aggregate counts only: no IBAN, question, request body, or raw IP. */
  increment(apiKeyId: string, operation: "validate" | "analyze" | "bank_search", failed: boolean): Promise<void>;
}
