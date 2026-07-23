// Create a Site (project) from a template, seeding one page per title entry.
// Returns the created Site.
import type { SiteApiRepository } from "../repositories/SiteApiRepository";
import type { SiteModel } from "../adapters/site.adapter";

export interface CreateSiteCommand {
  name: string;
  templateId: string;
  pages?: Array<{ title?: string }>;
}

export class CreateSiteUseCase {
  constructor(private readonly repository: SiteApiRepository) {}

  execute(command: CreateSiteCommand): Promise<SiteModel> {
    return this.repository.create({
      name: command.name,
      templateId: command.templateId,
      pages: command.pages,
    });
  }
}
