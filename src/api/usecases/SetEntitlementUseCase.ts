// Set the entitlement state for a module OR a template (e.g. unlock a paid item
// trial -> granted). Stands in for real billing/upgrade until auth lands.
import type { EntitlementApiRepository } from "../repositories/EntitlementApiRepository";
import type {
  SetEntitlementInput,
  SetEntitlementResultModel,
} from "../adapters/entitlement.adapter";

export type SetEntitlementCommand = SetEntitlementInput;

export class SetEntitlementUseCase {
  constructor(private readonly repository: EntitlementApiRepository) {}

  execute(command: SetEntitlementCommand): Promise<SetEntitlementResultModel> {
    return this.repository.set(command);
  }
}
