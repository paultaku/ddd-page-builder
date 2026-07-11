import type { Page } from "./Page";

// Port for page persistence. The concrete adapter (filesystem now, a DB later)
// is swappable without touching callers.
export interface PageRepository {
  save(page: Page): Promise<Page>;
  findById(uuid: string): Promise<Page | null>;
  listByOwner(ownerId: string): Promise<Page[]>;
}
