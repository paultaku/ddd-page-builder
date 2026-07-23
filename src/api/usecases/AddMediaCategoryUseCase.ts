// Add a media category by name. Returns the updated category list.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";

export class AddMediaCategoryUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(name: string): Promise<string[]> {
    return this.repository.addCategory(name);
  }
}
