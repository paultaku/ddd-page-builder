// Load a single Site plus its member page summaries.
import type { SiteApiRepository } from "../repositories/SiteApiRepository";
import type { SiteDetailModel } from "../adapters/site.adapter";

export class GetSiteUseCase {
  constructor(private readonly repository: SiteApiRepository) {}

  execute(id: string): Promise<SiteDetailModel> {
    return this.repository.get(id);
  }
}
