// Delete a user-authored template by id. Seeded templates are not deletable
// (server responds 403 -> ApiError).
import type { TemplateApiRepository } from "../repositories/TemplateApiRepository";

export class RemoveTemplateUseCase {
  constructor(private readonly repository: TemplateApiRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
