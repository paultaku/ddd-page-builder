// Publish (or unpublish) a page. Business logic: the server returns 403 with a
// `blockedModules`/`blockedTemplate` payload when a trial entitlement blocks the
// publish. This UseCase maps that specific case into a typed
// `PublishBlockedError` carrying the blocked names, so the editor can render the
// existing "Upgrade required for: …" message. Any other failure re-throws as-is.
import type { PageApiRepository } from "../repositories/PageApiRepository";
import type { PublishResultModel } from "../adapters/page.adapter";
import { ApiError } from "../http";
import { PublishBlockedPayloadSchema } from "../schemas/page.schema";

// Thrown when publishing is blocked by a trial entitlement. `names` are the
// blocked module/template display names; `message` is the ready-to-toast string.
export class PublishBlockedError extends Error {
  readonly names: string[];

  constructor(names: string[]) {
    super(`Upgrade required for: ${names.join(", ")}`);
    this.name = "PublishBlockedError";
    this.names = names;
    Object.setPrototypeOf(this, PublishBlockedError.prototype);
  }
}

export interface PublishPageCommand {
  uuid: string;
  published: boolean;
}

export class PublishPageUseCase {
  constructor(private readonly repository: PageApiRepository) {}

  async execute(command: PublishPageCommand): Promise<PublishResultModel> {
    try {
      return await this.repository.publish(command.uuid, command.published);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        const parsed = PublishBlockedPayloadSchema.safeParse(error.payload);
        if (parsed.success) {
          const names = [
            ...(parsed.data.blockedModules ?? []).map((m) => m.name),
            ...(parsed.data.blockedTemplate
              ? [parsed.data.blockedTemplate.name]
              : []),
          ];
          if (names.length > 0) {
            throw new PublishBlockedError(names);
          }
        }
      }
      throw error;
    }
  }
}
