// List the media library (files + categories in one call). Entry point the
// Media Library page calls on load.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";
import type { MediaListModel } from "../adapters/media.adapter";

export class ListMediaUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(): Promise<MediaListModel> {
    return this.repository.list();
  }
}
