// Load a single stored page by uuid. The editor calls this to hydrate from a
// server-stored page (/editor?uuid=...).
import type { PageApiRepository } from "../repositories/PageApiRepository";
import type { StoredPageModel } from "../adapters/page.adapter";

export class GetPageUseCase {
  constructor(private readonly repository: PageApiRepository) {}

  execute(uuid: string): Promise<StoredPageModel> {
    return this.repository.get(uuid);
  }
}
