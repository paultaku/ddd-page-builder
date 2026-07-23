// Save (upsert) a page. Business logic: wrap the page title into the server's
// `metadata.pageTitle` shape (done in the request adapter) and return only the
// fields the editor needs to update its state.
import type { PageApiRepository } from "../repositories/PageApiRepository";
import type { SavePageResultModel } from "../adapters/page.adapter";

export interface SavePageCommand {
  uuid: string;
  html: string;
  css?: string;
  templateId?: string;
  purchaseUrl?: string;
  pageTitle?: string;
}

export class SavePageUseCase {
  constructor(private readonly repository: PageApiRepository) {}

  execute(command: SavePageCommand): Promise<SavePageResultModel> {
    return this.repository.save({
      uuid: command.uuid,
      html: command.html,
      css: command.css,
      templateId: command.templateId,
      purchaseUrl: command.purchaseUrl,
      pageTitle: command.pageTitle,
    });
  }
}
