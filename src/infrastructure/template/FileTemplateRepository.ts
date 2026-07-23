import { promises as fs } from "fs";
import path from "path";
import type { Template } from "@/domain/template/Template";
import type { TemplateRepository } from "@/domain/template/TemplateRepository";
import { getPersistenceDriver } from "@/infrastructure/persistence/config";
import { SqliteTemplateRepository } from "./SqliteTemplateRepository";

// The user-template store extends the read-only domain port with the write ops
// (save/delete) the templates API needs. This is an infrastructure interface,
// not a domain port — it's the shared shape the File and Sqlite adapters honour
// so the factory can return either behind one type.
export interface UserTemplateRepository extends TemplateRepository {
  save(template: Template): Promise<Template>;
  delete(id: string): Promise<boolean>;
}

// User-authored templates: one JSON file per template under a gitignored data
// dir. Mirrors FilePageRepository. Adds save/delete beyond the read-only port.
const DATA_DIR = path.join(process.cwd(), ".data", "templates");

function isEnoent(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export class FileTemplateRepository implements UserTemplateRepository {
  private filePath(id: string): string {
    return path.join(DATA_DIR, `${id}.json`);
  }

  async findAll(): Promise<Template[]> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const files = await fs.readdir(DATA_DIR);
    const templates: Template[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
        templates.push(JSON.parse(raw) as Template);
      } catch {
        // Skip unreadable/corrupt files.
      }
    }
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Template | null> {
    try {
      const raw = await fs.readFile(this.filePath(id), "utf8");
      return JSON.parse(raw) as Template;
    } catch (err) {
      if (isEnoent(err)) return null;
      throw err;
    }
  }

  async save(template: Template): Promise<Template> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      this.filePath(template.id),
      JSON.stringify(template, null, 2),
      "utf8"
    );
    return template;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(id));
      return true;
    } catch (err) {
      if (isEnoent(err)) return false;
      throw err;
    }
  }
}

let repository: UserTemplateRepository | null = null;
export function getUserTemplateRepository(): UserTemplateRepository {
  if (!repository) {
    repository =
      getPersistenceDriver() === "sqlite"
        ? new SqliteTemplateRepository()
        : new FileTemplateRepository();
  }
  return repository;
}
