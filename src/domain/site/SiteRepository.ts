import type { Site } from "./Site";

// Port for site persistence. Filesystem now; DB adapter later (same interface).
export interface SiteRepository {
  save(site: Site): Promise<Site>;
  findById(id: string): Promise<Site | null>;
  listByOwner(ownerId: string): Promise<Site[]>;
}
