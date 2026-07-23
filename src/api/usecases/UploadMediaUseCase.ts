// Upload a media file (base64 data URL). Returns the stored item.
import type { MediaApiRepository } from "../repositories/MediaApiRepository";
import type {
  UploadMediaInput,
  MediaItemModel,
} from "../adapters/media.adapter";

export interface UploadMediaCommand {
  filename: string;
  mimeType: string;
  size?: number;
  dataUrl: string;
  category?: string | null;
}

export class UploadMediaUseCase {
  constructor(private readonly repository: MediaApiRepository) {}

  execute(command: UploadMediaCommand): Promise<MediaItemModel> {
    const input: UploadMediaInput = {
      filename: command.filename,
      mimeType: command.mimeType,
      size: command.size,
      dataUrl: command.dataUrl,
      category: command.category,
    };
    return this.repository.upload(input);
  }
}
