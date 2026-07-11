import type { Template } from "./Template";

// Port for the template catalog. Seeded (in-repo) now; a persisted adapter for
// user-authored templates (T2) can implement the same interface later.
export interface TemplateRepository {
  findAll(): Promise<Template[]>;
  findById(id: string): Promise<Template | null>;
}
