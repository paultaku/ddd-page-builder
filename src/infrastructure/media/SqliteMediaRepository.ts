import type { MediaItem } from "@/domain/media/MediaItem";
import type { MediaRepository } from "@/domain/media/MediaRepository";
import { getDb } from "@/infrastructure/persistence/sqlite/db";

// SQLite-backed media store: items + categories. Matches FileMediaRepository:
// - listItems ordered uploadedAt DESC, scoped to owner;
// - findItem returns null when absent; deleteItem returns whether a row existed;
// - categories kept sorted ascending; removeCategory also unassigns the category
//   from any items that referenced it (category -> null).
// Server-only (better-sqlite3 via getDb).

interface MediaRow {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  category: string | null;
  ownerId: string;
  uploadedAt: string;
}

function rowToItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mimeType,
    size: row.size,
    dataUrl: row.dataUrl,
    category: row.category ?? null,
    ownerId: row.ownerId,
    uploadedAt: row.uploadedAt,
  };
}

export class SqliteMediaRepository implements MediaRepository {
  async listItems(ownerId: string): Promise<MediaItem[]> {
    const rows = getDb()
      .prepare(
        `SELECT * FROM media WHERE ownerId = ? ORDER BY uploadedAt DESC`
      )
      .all(ownerId) as MediaRow[];
    return rows.map(rowToItem);
  }

  async findItem(id: string): Promise<MediaItem | null> {
    const row = getDb()
      .prepare(`SELECT * FROM media WHERE id = ?`)
      .get(id) as MediaRow | undefined;
    return row ? rowToItem(row) : null;
  }

  async saveItem(item: MediaItem): Promise<MediaItem> {
    getDb()
      .prepare(
        `INSERT INTO media
           (id, filename, mimeType, size, dataUrl, category, ownerId, uploadedAt)
         VALUES
           (@id, @filename, @mimeType, @size, @dataUrl, @category, @ownerId, @uploadedAt)
         ON CONFLICT(id) DO UPDATE SET
           filename=excluded.filename, mimeType=excluded.mimeType, size=excluded.size,
           dataUrl=excluded.dataUrl, category=excluded.category,
           ownerId=excluded.ownerId, uploadedAt=excluded.uploadedAt`
      )
      .run({
        id: item.id,
        filename: item.filename,
        mimeType: item.mimeType,
        size: item.size,
        dataUrl: item.dataUrl,
        category: item.category ?? null,
        ownerId: item.ownerId,
        uploadedAt: item.uploadedAt,
      });
    return item;
  }

  async deleteItem(id: string): Promise<boolean> {
    const info = getDb().prepare(`DELETE FROM media WHERE id = ?`).run(id);
    return info.changes > 0;
  }

  async listCategories(): Promise<string[]> {
    const rows = getDb()
      .prepare(`SELECT name FROM media_categories ORDER BY name ASC`)
      .all() as Array<{ name: string }>;
    return rows.map((r) => r.name);
  }

  async addCategory(name: string): Promise<string[]> {
    getDb()
      .prepare(
        `INSERT INTO media_categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING`
      )
      .run(name);
    return this.listCategories();
  }

  async removeCategory(name: string): Promise<string[]> {
    const db = getDb();
    const tx = db.transaction((cat: string) => {
      db.prepare(`DELETE FROM media_categories WHERE name = ?`).run(cat);
      // Unassign the removed category from any items that referenced it.
      db.prepare(`UPDATE media SET category = NULL WHERE category = ?`).run(cat);
    });
    tx(name);
    return this.listCategories();
  }
}
