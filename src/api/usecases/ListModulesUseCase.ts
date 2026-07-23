// List the module catalog (metadata + tier + entitlement + block HTML). Entry
// point the Module panel calls.
import type { ModuleApiRepository } from "../repositories/ModuleApiRepository";
import type { ModuleSummaryModel } from "../adapters/module.adapter";

export class ListModulesUseCase {
  constructor(private readonly repository: ModuleApiRepository) {}

  execute(): Promise<ModuleSummaryModel[]> {
    return this.repository.list();
  }
}
