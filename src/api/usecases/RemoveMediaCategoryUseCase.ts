// Remove a media category by name (items keep their files). Returns the updated
// category list.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";

export class RemoveMediaCategoryUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(name: string): Promise<string[]> {
    return this.repository.removeCategory(name);
  }
}
