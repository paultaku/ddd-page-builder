import type { Template } from "@/domain/template/Template";
import { getDb } from "@/infrastructure/persistence/sqlite/db";
import type { UserTemplateRepository } from "./FileTemplateRepository";

// SQLite-backed store for USER-authored templates — the same store
// FileTemplateRepository backs. Seeded (in-repo) templates STAY in code
// (SeededTemplateRepository) and are NOT persisted here. Matches
// FileTemplateRepository behaviour: findAll ordered by name ASC; findById /
// deleteItem null/false semantics; save upserts. Server-only (getDb).

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  tier: string;
  source: string;
  ownerId: string | null;
  thumbnail: string | null;
  html: string;
  css: string;
}

function rowToTemplate(row: TemplateRow): Template {
  const t: Template = {
    id: row.id,
    name: row.name,
    category: row.category as Template["category"],
    tier: row.tier as Template["tier"],
    source: row.source as Template["source"],
    html: row.html,
    css: row.css,
  };
  if (row.ownerId != null) t.ownerId = row.ownerId;
  if (row.thumbnail != null) t.thumbnail = row.thumbnail;
  return t;
}

export class SqliteTemplateRepository implements UserTemplateRepository {
  async findAll(): Promise<Template[]> {
    const rows = getDb()
      .prepare(`SELECT * FROM user_templates ORDER BY name ASC`)
      .all() as TemplateRow[];
    return rows.map(rowToTemplate);
  }

  async findById(id: string): Promise<Template | null> {
    const row = getDb()
      .prepare(`SELECT * FROM user_templates WHERE id = ?`)
      .get(id) as TemplateRow | undefined;
    return row ? rowToTemplate(row) : null;
  }

  async save(template: Template): Promise<Template> {
    getDb()
      .prepare(
        `INSERT INTO user_templates
           (id, name, category, tier, source, ownerId, thumbnail, html, css)
         VALUES
           (@id, @name, @category, @tier, @source, @ownerId, @thumbnail, @html, @css)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, category=excluded.category, tier=excluded.tier,
           source=excluded.source, ownerId=excluded.ownerId, thumbnail=excluded.thumbnail,
           html=excluded.html, css=excluded.css`
      )
      .run({
        id: template.id,
        name: template.name,
        category: template.category,
        tier: template.tier,
        source: template.source,
        ownerId: template.ownerId ?? null,
        thumbnail: template.thumbnail ?? null,
        html: template.html,
        css: template.css,
      });
    return template;
  }

  async delete(id: string): Promise<boolean> {
    const info = getDb()
      .prepare(`DELETE FROM user_templates WHERE id = ?`)
      .run(id);
    return info.changes > 0;
  }
}
