// List the media categories (standalone endpoint). The Media page reads
// categories from the combined list; this covers the dedicated categories route.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";

export class ListMediaCategoriesUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(): Promise<string[]> {
    return this.repository.listCategories();
  }
}
