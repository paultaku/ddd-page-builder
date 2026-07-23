// Delete a media item by id.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";

export class RemoveMediaUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
