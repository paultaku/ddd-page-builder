// Save the current canvas as a reusable user template (T2). User templates are
// free and owned — never publish-gated.
import type { TemplateApiRepository } from "../repositories/TemplateApiRepository";
import type {
  CreateTemplateInput,
  FullTemplateModel,
} from "../adapters/template.adapter";

export interface CreateTemplateCommand {
  name: string;
  category?: string;
  html: string;
  css?: string;
}

export class CreateTemplateUseCase {
  constructor(private readonly repository: TemplateApiRepository) {}

  execute(command: CreateTemplateCommand): Promise<FullTemplateModel> {
    const input: CreateTemplateInput = {
      name: command.name,
      category: command.category,
      html: command.html,
      css: command.css,
    };
    return this.repository.create(input);
  }
}
