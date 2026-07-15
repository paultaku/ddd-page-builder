import type { Site } from "./Site";

// Port for site persistence. Filesystem now; DB adapter later (same interface).
export interface SiteRepository {
  save(site: Site): Promise<Site>;
  findById(id: string): Promise<Site | null>;
  listByOwner(ownerId: string): Promise<Site[]>;
  // The Site a page currently belongs to, if any. Membership is single-project,
  // so at most one Site is returned; used at render time to resolve the palette
  // a page delegates to.
  findByPageId(pageId: string): Promise<Site | null>;
}
