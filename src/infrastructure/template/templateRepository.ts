import type { Template } from "@/domain/template/Template";
import type { TemplateRepository } from "@/domain/template/TemplateRepository";
import { getSeededTemplateRepository } from "./SeededTemplateRepository";
import { getUserTemplateRepository } from "./FileTemplateRepository";

// Reads across several template sources as one catalog. findById checks each in
// order and returns the first match; findAll concatenates. Callers (catalog
// list, import, publish gate) use this and transparently see seed + user.
class CompositeTemplateRepository implements TemplateRepository {
  constructor(private readonly repos: TemplateRepository[]) {}

  async findAll(): Promise<Template[]> {
    const groups = await Promise.all(this.repos.map((r) => r.findAll()));
    return groups.flat();
  }

  async findById(id: string): Promise<Template | null> {
    for (const repo of this.repos) {
      const found = await repo.findById(id);
      if (found) return found;
    }
    return null;
  }
}

let composite: TemplateRepository | null = null;
export function getTemplateRepository(): TemplateRepository {
  if (!composite) {
    // Seed first so starter templates lead the catalog; user templates append.
    composite = new CompositeTemplateRepository([
      getSeededTemplateRepository(),
      getUserTemplateRepository(),
    ]);
  }
  return composite;
}
