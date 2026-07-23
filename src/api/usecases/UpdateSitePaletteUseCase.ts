// Update a Site's theme color palette (project-level). Returns the updated Site.
// Assigned pages delegate to the new palette on their next render.
import type { SiteApiRepository } from "../repositories/SiteApiRepository";
import type { SiteModel } from "../adapters/site.adapter";
import type { ColorPalette } from "../schemas/site.schema";

export interface UpdateSitePaletteCommand {
  siteId: string;
  colorPalette: Partial<ColorPalette>;
}

export class UpdateSitePaletteUseCase {
  constructor(private readonly repository: SiteApiRepository) {}

  execute(command: UpdateSitePaletteCommand): Promise<SiteModel> {
    return this.repository.update(command.siteId, {
      colorPalette: command.colorPalette,
    });
  }
}
