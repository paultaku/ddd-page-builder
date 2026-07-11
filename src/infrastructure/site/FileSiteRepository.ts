import { promises as fs } from "fs";
import path from "path";
import { normalizeSite, type Site } from "@/domain/site/Site";
import type { SiteRepository } from "@/domain/site/SiteRepository";

// Filesystem-backed site store: one JSON file per site. Mirrors
// FilePageRepository; requires the Node.js runtime.
const DATA_DIR = path.join(process.cwd(), ".data", "sites");

export class FileSiteRepository implements SiteRepository {
  private async ensureDir(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
  private filePath(id: string): string {
    return path.join(DATA_DIR, `${id}.json`);
  }

  async save(site: Site): Promise<Site> {
    await this.ensureDir();
    await fs.writeFile(
      this.filePath(site.id),
      JSON.stringify(site, null, 2),
      "utf8"
    );
    return site;
  }

  async findById(id: string): Promise<Site | null> {
    try {
      const raw = await fs.readFile(this.filePath(id), "utf8");
      return normalizeSite(JSON.parse(raw));
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        (err as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return null;
      }
      throw err;
    }
  }

  async listByOwner(ownerId: string): Promise<Site[]> {
    await this.ensureDir();
    const files = await fs.readdir(DATA_DIR);
    const sites: Site[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
        const site = normalizeSite(JSON.parse(raw));
        if (site.ownerId === ownerId) sites.push(site);
      } catch {
        // Skip corrupt files.
      }
    }
    return sites.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

let repository: SiteRepository | null = null;
export function getSiteRepository(): SiteRepository {
  if (!repository) repository = new FileSiteRepository();
  return repository;
}
