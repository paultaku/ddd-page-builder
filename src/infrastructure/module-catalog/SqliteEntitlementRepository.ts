import {
  defaultEntitlement,
  type EntitlementRepository,
  type EntitlementState,
} from "@/domain/module-catalog/Entitlement";
import type { ModuleTier } from "@/domain/module-catalog/Module";
import { getDb } from "@/infrastructure/persistence/sqlite/db";

// SQLite-backed entitlement store: one row per (owner, moduleKey). Matches
// FileEntitlementRepository behaviour EXACTLY — a MISSING row falls back to the
// tier default (defaultEntitlement(tier)) and NEVER throws. Only setState
// persists a row. Server-only (better-sqlite3 via getDb).

interface EntitlementRow {
  state: EntitlementState;
}

export class SqliteEntitlementRepository implements EntitlementRepository {
  async getState(
    ownerId: string,
    moduleId: string,
    tier: ModuleTier
  ): Promise<EntitlementState> {
    const row = getDb()
      .prepare(
        `SELECT state FROM entitlements WHERE ownerId = ? AND moduleKey = ?`
      )
      .get(ownerId, moduleId) as EntitlementRow | undefined;
    return row ? row.state : defaultEntitlement(tier);
  }

  async setState(
    ownerId: string,
    moduleId: string,
    state: EntitlementState
  ): Promise<void> {
    getDb()
      .prepare(
        `INSERT INTO entitlements (ownerId, moduleKey, state)
         VALUES (@ownerId, @moduleKey, @state)
         ON CONFLICT(ownerId, moduleKey) DO UPDATE SET state=excluded.state`
      )
      .run({ ownerId, moduleKey: moduleId, state });
  }
}
