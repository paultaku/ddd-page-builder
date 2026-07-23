// List the current owner's pages. Entry point the dashboard calls.
import type { PageApiRepository } from "../repositories/PageApiRepository";
import type { PageSummaryModel } from "../adapters/page.adapter";

export class ListPagesUseCase {
  constructor(private readonly repository: PageApiRepository) {}

  execute(): Promise<PageSummaryModel[]> {
    return this.repository.list();
  }
}
