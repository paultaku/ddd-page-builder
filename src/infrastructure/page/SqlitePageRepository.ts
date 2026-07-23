import { normalizePage, type Page } from "@/domain/page/Page";
import type { PageRepository } from "@/domain/page/PageRepository";
import { getDb } from "@/infrastructure/persistence/sqlite/db";

// SQLite-backed page store. Behaviour matches FilePageRepository exactly:
// - findById returns null when absent (never throws);
// - listByOwner is ordered updatedAt DESC;
// - every read runs through normalizePage (forward-compat coercion);
// - `published` boolean maps to INTEGER 0/1.
// Server-only (better-sqlite3 via getDb).

interface PageRow {
  uuid: string;
  title: string;
  html: string;
  css: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  published: number;
  publishedAt: string | null;
  slug: string | null;
  templateId: string | null;
  purchaseUrl: string | null;
}

function rowToPage(row: PageRow): Page {
  const raw: Partial<Page> & { uuid: string } = {
    uuid: row.uuid,
    title: row.title,
    html: row.html,
    css: row.css,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    published: row.published === 1,
  };
  if (row.publishedAt != null) raw.publishedAt = row.publishedAt;
  if (row.slug != null) raw.slug = row.slug;
  if (row.templateId != null) raw.templateId = row.templateId;
  if (row.purchaseUrl != null) raw.purchaseUrl = row.purchaseUrl;
  return normalizePage(raw);
}

export class SqlitePageRepository implements PageRepository {
  async save(page: Page): Promise<Page> {
    getDb()
      .prepare(
        `INSERT INTO pages
           (uuid, title, html, css, ownerId, createdAt, updatedAt, published, publishedAt, slug, templateId, purchaseUrl)
         VALUES
           (@uuid, @title, @html, @css, @ownerId, @createdAt, @updatedAt, @published, @publishedAt, @slug, @templateId, @purchaseUrl)
         ON CONFLICT(uuid) DO UPDATE SET
           title=excluded.title, html=excluded.html, css=excluded.css,
           ownerId=excluded.ownerId, createdAt=excluded.createdAt, updatedAt=excluded.updatedAt,
           published=excluded.published, publishedAt=excluded.publishedAt, slug=excluded.slug,
           templateId=excluded.templateId, purchaseUrl=excluded.purchaseUrl`
      )
      .run({
        uuid: page.uuid,
        title: page.title,
        html: page.html,
        css: page.css,
        ownerId: page.ownerId,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        published: page.published ? 1 : 0,
        publishedAt: page.publishedAt ?? null,
        slug: page.slug ?? null,
        templateId: page.templateId ?? null,
        purchaseUrl: page.purchaseUrl ?? null,
      });
    return page;
  }

  async findById(uuid: string): Promise<Page | null> {
    const row = getDb()
      .prepare(`SELECT * FROM pages WHERE uuid = ?`)
      .get(uuid) as PageRow | undefined;
    return row ? rowToPage(row) : null;
  }

  async listByOwner(ownerId: string): Promise<Page[]> {
    const rows = getDb()
      .prepare(
        `SELECT * FROM pages WHERE ownerId = ? ORDER BY updatedAt DESC`
      )
      .all(ownerId) as PageRow[];
    return rows.map(rowToPage);
  }
}
