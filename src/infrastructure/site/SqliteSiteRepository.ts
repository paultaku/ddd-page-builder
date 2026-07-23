import { normalizeSite, type Site } from "@/domain/site/Site";
import type { SiteRepository } from "@/domain/site/SiteRepository";
import { getDb } from "@/infrastructure/persistence/sqlite/db";

// SQLite-backed site store. Matches FileSiteRepository behaviour:
// - colorPalette + pageIds are JSON columns (parse on read, stringify on write);
// - findByPageId resolves the single owning project via json_each(pageIds);
// - listByOwner/readAll ordered updatedAt DESC;
// - every read runs through normalizeSite; `published` maps to INTEGER 0/1.
// Server-only (better-sqlite3 via getDb).

interface SiteRow {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  colorPalette: string;
  pageIds: string;
  createdAt: string;
  updatedAt: string;
  published: number;
}

function rowToSite(row: SiteRow): Site {
  let pageIds: unknown = [];
  let colorPalette: unknown = undefined;
  try {
    pageIds = JSON.parse(row.pageIds);
  } catch {
    pageIds = [];
  }
  try {
    colorPalette = JSON.parse(row.colorPalette);
  } catch {
    colorPalette = undefined;
  }
  return normalizeSite({
    id: row.id,
    name: row.name,
    ownerId: row.ownerId,
    templateId: row.templateId,
    pageIds: Array.isArray(pageIds) ? (pageIds as string[]) : [],
    colorPalette: colorPalette as Site["colorPalette"] | undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    published: row.published === 1,
  });
}

export class SqliteSiteRepository implements SiteRepository {
  async save(site: Site): Promise<Site> {
    getDb()
      .prepare(
        `INSERT INTO sites
           (id, name, ownerId, templateId, colorPalette, pageIds, createdAt, updatedAt, published)
         VALUES
           (@id, @name, @ownerId, @templateId, @colorPalette, @pageIds, @createdAt, @updatedAt, @published)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, ownerId=excluded.ownerId, templateId=excluded.templateId,
           colorPalette=excluded.colorPalette, pageIds=excluded.pageIds,
           createdAt=excluded.createdAt, updatedAt=excluded.updatedAt, published=excluded.published`
      )
      .run({
        id: site.id,
        name: site.name,
        ownerId: site.ownerId,
        templateId: site.templateId,
        colorPalette: JSON.stringify(site.colorPalette),
        pageIds: JSON.stringify(site.pageIds),
        createdAt: site.createdAt,
        updatedAt: site.updatedAt,
        published: site.published ? 1 : 0,
      });
    return site;
  }

  async findById(id: string): Promise<Site | null> {
    const row = getDb()
      .prepare(`SELECT * FROM sites WHERE id = ?`)
      .get(id) as SiteRow | undefined;
    return row ? rowToSite(row) : null;
  }

  async listByOwner(ownerId: string): Promise<Site[]> {
    const rows = getDb()
      .prepare(`SELECT * FROM sites WHERE ownerId = ? ORDER BY updatedAt DESC`)
      .all(ownerId) as SiteRow[];
    return rows.map(rowToSite);
  }

  async findByPageId(pageId: string): Promise<Site | null> {
    // Membership is single-project, so at most one Site matches. Newest-first to
    // stay consistent with the file store's readAll ordering.
    const row = getDb()
      .prepare(
        `SELECT * FROM sites
         WHERE EXISTS (SELECT 1 FROM json_each(sites.pageIds) WHERE value = ?)
         ORDER BY updatedAt DESC
         LIMIT 1`
      )
      .get(pageId) as SiteRow | undefined;
    return row ? rowToSite(row) : null;
  }
}
