// Assign a page to a project (Site), or detach it (siteId=null). Returns the
// resulting project id. The dashboard reloads its lists after this resolves.
import type { PageApiRepository } from "../repositories/PageApiRepository";
import type { AssignProjectResultModel } from "../adapters/page.adapter";

export interface AssignPageToProjectCommand {
  uuid: string;
  siteId: string | null;
}

export class AssignPageToProjectUseCase {
  constructor(private readonly repository: PageApiRepository) {}

  execute(
    command: AssignPageToProjectCommand
  ): Promise<AssignProjectResultModel> {
    return this.repository.assignProject(command.uuid, command.siteId);
  }
}
