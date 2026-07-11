import { promises as fs } from "fs";
import path from "path";
import { normalizePage, type Page } from "@/domain/page/Page";
import type { PageRepository } from "@/domain/page/PageRepository";

// Filesystem-backed adapter. One JSON file per page under a gitignored data dir.
// Requires the Node.js runtime (not edge) — route handlers using it declare
// `export const runtime = "nodejs"`. Swap for a DB adapter later with no caller
// changes. Concurrent writes to the same uuid are last-writer-wins (no locking).
const DATA_DIR = path.join(process.cwd(), ".data", "pages");

export class FilePageRepository implements PageRepository {
  private async ensureDir(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  private filePath(uuid: string): string {
    return path.join(DATA_DIR, `${uuid}.json`);
  }

  async save(page: Page): Promise<Page> {
    await this.ensureDir();
    await fs.writeFile(
      this.filePath(page.uuid),
      JSON.stringify(page, null, 2),
      "utf8"
    );
    return page;
  }

  async findById(uuid: string): Promise<Page | null> {
    try {
      const raw = await fs.readFile(this.filePath(uuid), "utf8");
      return normalizePage(JSON.parse(raw));
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

  async listByOwner(ownerId: string): Promise<Page[]> {
    await this.ensureDir();
    const files = await fs.readdir(DATA_DIR);
    const pages: Page[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
        const page = normalizePage(JSON.parse(raw));
        if (page.ownerId === ownerId) pages.push(page);
      } catch {
        // Skip unreadable/corrupt files rather than failing the whole listing.
      }
    }
    return pages.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

// Single shared instance so the (deferred) DB swap happens in exactly one place.
let repository: PageRepository | null = null;
export function getPageRepository(): PageRepository {
  if (!repository) repository = new FilePageRepository();
  return repository;
}
