import { promises as fs } from "fs";
import path from "path";
import {
  defaultEntitlement,
  type EntitlementRepository,
  type EntitlementState,
} from "@/domain/module-catalog/Entitlement";
import type { ModuleTier } from "@/domain/module-catalog/Module";

// File-backed entitlement store: one JSON file per owner mapping moduleId to
// state. Missing entries fall back to the tier default. Swappable for a DB /
// billing-derived adapter once auth lands (same port).
const DATA_DIR = path.join(process.cwd(), ".data", "entitlements");

type OwnerStates = Record<string, EntitlementState>;

export class FileEntitlementRepository implements EntitlementRepository {
  private ownerFile(ownerId: string): string {
    return path.join(DATA_DIR, `${ownerId}.json`);
  }

  private async readOwner(ownerId: string): Promise<OwnerStates> {
    try {
      const raw = await fs.readFile(this.ownerFile(ownerId), "utf8");
      return JSON.parse(raw) as OwnerStates;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        (err as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return {};
      }
      throw err;
    }
  }

  async getState(
    ownerId: string,
    moduleId: string,
    tier: ModuleTier
  ): Promise<EntitlementState> {
    const states = await this.readOwner(ownerId);
    return states[moduleId] ?? defaultEntitlement(tier);
  }

  async setState(
    ownerId: string,
    moduleId: string,
    state: EntitlementState
  ): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const states = await this.readOwner(ownerId);
    states[moduleId] = state;
    await fs.writeFile(
      this.ownerFile(ownerId),
      JSON.stringify(states, null, 2),
      "utf8"
    );
  }
}

let repository: EntitlementRepository | null = null;
export function getEntitlementRepository(): EntitlementRepository {
  if (!repository) repository = new FileEntitlementRepository();
  return repository;
}
