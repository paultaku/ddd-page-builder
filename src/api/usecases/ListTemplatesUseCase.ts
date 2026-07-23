// List the template catalog (metadata + entitlement per template). Entry point
// the Template panel and the Create-site form call.
import type { TemplateApiRepository } from "../repositories/TemplateApiRepository";
import type { TemplateSummaryModel } from "../adapters/template.adapter";

export class ListTemplatesUseCase {
  constructor(private readonly repository: TemplateApiRepository) {}

  execute(): Promise<TemplateSummaryModel[]> {
    return this.repository.list();
  }
}
