import type { ModuleTier } from "./Module";

// Membership & Access bounded context.
//
// Entitlement is a per-(owner, module) state machine. `trial` is the key state:
// a paid module in `trial` can be placed, configured and previewed, and is
// gated only at publish — moving the paywall from discovery to value-realized.
export type EntitlementState = "locked" | "trial" | "granted";

// Default state derived from tier while auth/billing are deferred: free modules
// are granted outright; paid modules start in trial (usable, publish-gated).
export function defaultEntitlement(tier: ModuleTier): EntitlementState {
  return tier === "paid" ? "trial" : "granted";
}

// Only `granted` clears the publish gate.
export function isPublishable(state: EntitlementState): boolean {
  return state === "granted";
}

const TRANSITIONS: Record<EntitlementState, EntitlementState[]> = {
  locked: ["trial", "granted"],
  trial: ["granted", "locked"],
  granted: ["locked"],
};

export function canTransition(
  from: EntitlementState,
  to: EntitlementState
): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

// Port for entitlement persistence. `getState` falls back to the tier default
// when nothing is stored yet.
export interface EntitlementRepository {
  getState(
    ownerId: string,
    moduleId: string,
    tier: ModuleTier
  ): Promise<EntitlementState>;
  setState(
    ownerId: string,
    moduleId: string,
    state: EntitlementState
  ): Promise<void>;
}
