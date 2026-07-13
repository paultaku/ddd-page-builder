import { promises as fs } from "fs";
import path from "path";
import type { MediaItem } from "@/domain/media/MediaItem";
import type { MediaRepository } from "@/domain/media/MediaRepository";

// Filesystem media store: one JSON file per item (data URL inline) under a
// gitignored data dir, plus a categories.json. Requires the Node.js runtime.
const MEDIA_DIR = path.join(process.cwd(), ".data", "media");
const ITEMS_DIR = path.join(MEDIA_DIR, "items");
const CATEGORIES_FILE = path.join(MEDIA_DIR, "categories.json");

function isEnoent(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export class FileMediaRepository implements MediaRepository {
  private itemPath(id: string): string {
    return path.join(ITEMS_DIR, `${id}.json`);
  }

  async listItems(ownerId: string): Promise<MediaItem[]> {
    await fs.mkdir(ITEMS_DIR, { recursive: true });
    const files = await fs.readdir(ITEMS_DIR);
    const items: MediaItem[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(ITEMS_DIR, file), "utf8");
        const item = JSON.parse(raw) as MediaItem;
        if (item.ownerId === ownerId) items.push(item);
      } catch {
        // skip corrupt
      }
    }
    return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  async findItem(id: string): Promise<MediaItem | null> {
    try {
      const raw = await fs.readFile(this.itemPath(id), "utf8");
      return JSON.parse(raw) as MediaItem;
    } catch (err) {
      if (isEnoent(err)) return null;
      throw err;
    }
  }

  async saveItem(item: MediaItem): Promise<MediaItem> {
    await fs.mkdir(ITEMS_DIR, { recursive: true });
    await fs.writeFile(this.itemPath(item.id), JSON.stringify(item), "utf8");
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.itemPath(id));
      return true;
    } catch (err) {
      if (isEnoent(err)) return false;
      throw err;
    }
  }

  async listCategories(): Promise<string[]> {
    try {
      const raw = await fs.readFile(CATEGORIES_FILE, "utf8");
      return JSON.parse(raw) as string[];
    } catch (err) {
      if (isEnoent(err)) return [];
      throw err;
    }
  }

  private async writeCategories(categories: string[]): Promise<void> {
    await fs.mkdir(MEDIA_DIR, { recursive: true });
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories), "utf8");
  }

  async addCategory(name: string): Promise<string[]> {
    const categories = await this.listCategories();
    if (!categories.includes(name)) categories.push(name);
    categories.sort();
    await this.writeCategories(categories);
    return categories;
  }

  async removeCategory(name: string): Promise<string[]> {
    const categories = (await this.listCategories()).filter((c) => c !== name);
    await this.writeCategories(categories);
    // Unassign the removed category from any items that referenced it.
    await this.unassignCategory(name);
    return categories;
  }

  private async unassignCategory(name: string): Promise<void> {
    try {
      const files = await fs.readdir(ITEMS_DIR);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const p = path.join(ITEMS_DIR, file);
        try {
          const item = JSON.parse(await fs.readFile(p, "utf8")) as MediaItem;
          if (item.category === name) {
            item.category = null;
            await fs.writeFile(p, JSON.stringify(item), "utf8");
          }
        } catch {
          // skip corrupt
        }
      }
    } catch (err) {
      if (!isEnoent(err)) throw err;
    }
  }
}

let repository: MediaRepository | null = null;
export function getMediaRepository(): MediaRepository {
  if (!repository) repository = new FileMediaRepository();
  return repository;
}
