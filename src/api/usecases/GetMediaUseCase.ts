// Get a single media item by id. There is no `GET /api/media/{id}` route, so the
// repository reads the list and selects — see MediaApiRepository.get.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";
import type { MediaItemModel } from "../adapters/media.adapter";

export class GetMediaUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(id: string): Promise<MediaItemModel> {
    return this.repository.get(id);
  }
}
