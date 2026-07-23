// Get a full template (html + css) for importing into the editor canvas.
import type { TemplateApiRepository } from "../repositories/TemplateApiRepository";
import type { FullTemplateModel } from "../adapters/template.adapter";

export class GetTemplateUseCase {
  constructor(private readonly repository: TemplateApiRepository) {}

  execute(id: string): Promise<FullTemplateModel> {
    return this.repository.get(id);
  }
}
