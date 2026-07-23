// List the current owner's sites (projects). Entry point the dashboard calls.
import type { SiteApiRepository } from "../repositories/SiteApiRepository";
import type { SiteSummaryModel } from "../adapters/site.adapter";

export class ListSitesUseCase {
  constructor(private readonly repository: SiteApiRepository) {}

  execute(): Promise<SiteSummaryModel[]> {
    return this.repository.list();
  }
}
