// Update a media item: rename and/or reassign its category (PATCH). Either field
// may be supplied; the server applies whichever is present.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";
import type {
  UpdateMediaInput,
  MediaItemModel,
} from "../adapters/media.adapter";

export interface UpdateMediaCommand {
  id: string;
  filename?: string;
  category?: string | null;
}

export class UpdateMediaUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(command: UpdateMediaCommand): Promise<MediaItemModel> {
    const input: UpdateMediaInput = {
      filename: command.filename,
      category: command.category,
    };
    return this.repository.update(command.id, input);
  }
}
