// DI composition root for the client-side API layer.
//
// Repositories are instantiated once and injected into the UseCases. Components
// import the ready-to-use UseCase singletons from here and never touch fetch,
// repositories, adapters, or schemas directly. Swapping a repository (e.g. a
// mock in tests) means re-wiring only this file.
import { PageApiRepository } from "./repositories/PageApiRepository";
import { SiteApiRepository } from "./repositories/SiteApiRepository";
import { MediaApiRepository } from "./repositories/MediaApiRepository";
import { TemplateApiRepository } from "./repositories/TemplateApiRepository";
import { EntitlementApiRepository } from "./repositories/EntitlementApiRepository";
import { ModuleApiRepository } from "./repositories/ModuleApiRepository";
import { AuthApiRepository } from "./repositories/AuthApiRepository";
import { ListPagesUseCase } from "./usecases/ListPagesUseCase";
import { GetPageUseCase } from "./usecases/GetPageUseCase";
import { SavePageUseCase } from "./usecases/SavePageUseCase";
import { PublishPageUseCase } from "./usecases/PublishPageUseCase";
import { AssignPageToProjectUseCase } from "./usecases/AssignPageToProjectUseCase";
import { ListSitesUseCase } from "./usecases/ListSitesUseCase";
import { CreateSiteUseCase } from "./usecases/CreateSiteUseCase";
import { GetSiteUseCase } from "./usecases/GetSiteUseCase";
import { UpdateSitePaletteUseCase } from "./usecases/UpdateSitePaletteUseCase";
import { ListMediaUseCase } from "./usecases/ListMediaUseCase";
import { GetMediaUseCase } from "./usecases/GetMediaUseCase";
import { UploadMediaUseCase } from "./usecases/UploadMediaUseCase";
import { UpdateMediaUseCase } from "./usecases/UpdateMediaUseCase";
import { RemoveMediaUseCase } from "./usecases/RemoveMediaUseCase";
import { ListMediaCategoriesUseCase } from "./usecases/ListMediaCategoriesUseCase";
import { AddMediaCategoryUseCase } from "./usecases/AddMediaCategoryUseCase";
import { RemoveMediaCategoryUseCase } from "./usecases/RemoveMediaCategoryUseCase";
import { ListTemplatesUseCase } from "./usecases/ListTemplatesUseCase";
import { GetTemplateUseCase } from "./usecases/GetTemplateUseCase";
import { CreateTemplateUseCase } from "./usecases/CreateTemplateUseCase";
import { RemoveTemplateUseCase } from "./usecases/RemoveTemplateUseCase";
import { SetEntitlementUseCase } from "./usecases/SetEntitlementUseCase";
import { ListModulesUseCase } from "./usecases/ListModulesUseCase";
import { LoginUseCase } from "./usecases/LoginUseCase";

// --- Composition: repositories (transport singletons) ----------------------
const pageRepository = new PageApiRepository();
const siteRepository = new SiteApiRepository();
const mediaRepository = new MediaApiRepository();
const templateRepository = new TemplateApiRepository();
const entitlementRepository = new EntitlementApiRepository();
const moduleRepository = new ModuleApiRepository();
const authRepository = new AuthApiRepository();

// --- Composition: ready-to-use UseCase singletons --------------------------
// Pages
export const listPagesUseCase = new ListPagesUseCase(pageRepository);
export const getPageUseCase = new GetPageUseCase(pageRepository);
export const savePageUseCase = new SavePageUseCase(pageRepository);
export const publishPageUseCase = new PublishPageUseCase(pageRepository);
export const assignPageToProjectUseCase = new AssignPageToProjectUseCase(
  pageRepository
);
// Sites (projects)
export const listSitesUseCase = new ListSitesUseCase(siteRepository);
export const createSiteUseCase = new CreateSiteUseCase(siteRepository);
export const getSiteUseCase = new GetSiteUseCase(siteRepository);
export const updateSitePaletteUseCase = new UpdateSitePaletteUseCase(
  siteRepository
);
// Media
export const listMediaUseCase = new ListMediaUseCase(mediaRepository);
export const getMediaUseCase = new GetMediaUseCase(mediaRepository);
export const uploadMediaUseCase = new UploadMediaUseCase(mediaRepository);
export const updateMediaUseCase = new UpdateMediaUseCase(mediaRepository);
export const removeMediaUseCase = new RemoveMediaUseCase(mediaRepository);
export const listMediaCategoriesUseCase = new ListMediaCategoriesUseCase(
  mediaRepository
);
export const addMediaCategoryUseCase = new AddMediaCategoryUseCase(
  mediaRepository
);
export const removeMediaCategoryUseCase = new RemoveMediaCategoryUseCase(
  mediaRepository
);
// Templates
export const listTemplatesUseCase = new ListTemplatesUseCase(
  templateRepository
);
export const getTemplateUseCase = new GetTemplateUseCase(templateRepository);
export const createTemplateUseCase = new CreateTemplateUseCase(
  templateRepository
);
export const removeTemplateUseCase = new RemoveTemplateUseCase(
  templateRepository
);
// Entitlement
export const setEntitlementUseCase = new SetEntitlementUseCase(
  entitlementRepository
);
// Modules
export const listModulesUseCase = new ListModulesUseCase(moduleRepository);
// Auth
export const loginUseCase = new LoginUseCase(authRepository);

// --- Transport + typed errors ---------------------------------------------
export { ApiError } from "./http";
export { PublishBlockedError } from "./usecases/PublishPageUseCase";

// --- Classes (for custom composition / tests) ------------------------------
export { PageApiRepository } from "./repositories/PageApiRepository";
export { SiteApiRepository } from "./repositories/SiteApiRepository";
export { MediaApiRepository } from "./repositories/MediaApiRepository";
export { TemplateApiRepository } from "./repositories/TemplateApiRepository";
export { EntitlementApiRepository } from "./repositories/EntitlementApiRepository";
export { ModuleApiRepository } from "./repositories/ModuleApiRepository";
export { AuthApiRepository } from "./repositories/AuthApiRepository";
export { ListPagesUseCase } from "./usecases/ListPagesUseCase";
export { GetPageUseCase } from "./usecases/GetPageUseCase";
export { SavePageUseCase } from "./usecases/SavePageUseCase";
export { PublishPageUseCase } from "./usecases/PublishPageUseCase";
export { AssignPageToProjectUseCase } from "./usecases/AssignPageToProjectUseCase";
export { ListSitesUseCase } from "./usecases/ListSitesUseCase";
export { CreateSiteUseCase } from "./usecases/CreateSiteUseCase";
export { GetSiteUseCase } from "./usecases/GetSiteUseCase";
export { UpdateSitePaletteUseCase } from "./usecases/UpdateSitePaletteUseCase";
export { ListMediaUseCase } from "./usecases/ListMediaUseCase";
export { GetMediaUseCase } from "./usecases/GetMediaUseCase";
export { UploadMediaUseCase } from "./usecases/UploadMediaUseCase";
export { UpdateMediaUseCase } from "./usecases/UpdateMediaUseCase";
export { RemoveMediaUseCase } from "./usecases/RemoveMediaUseCase";
export { ListMediaCategoriesUseCase } from "./usecases/ListMediaCategoriesUseCase";
export { AddMediaCategoryUseCase } from "./usecases/AddMediaCategoryUseCase";
export { RemoveMediaCategoryUseCase } from "./usecases/RemoveMediaCategoryUseCase";
export { ListTemplatesUseCase } from "./usecases/ListTemplatesUseCase";
export { GetTemplateUseCase } from "./usecases/GetTemplateUseCase";
export { CreateTemplateUseCase } from "./usecases/CreateTemplateUseCase";
export { RemoveTemplateUseCase } from "./usecases/RemoveTemplateUseCase";
export { SetEntitlementUseCase } from "./usecases/SetEntitlementUseCase";
export { ListModulesUseCase } from "./usecases/ListModulesUseCase";
export { LoginUseCase } from "./usecases/LoginUseCase";

// --- Model / command types -------------------------------------------------
export type {
  PageSummaryModel,
  StoredPageModel,
  SavePageResultModel,
  PublishResultModel,
  AssignProjectResultModel,
} from "./adapters/page.adapter";
export type {
  SiteModel,
  SiteSummaryModel,
  SiteDetailModel,
  SiteDetailPageModel,
} from "./adapters/site.adapter";
export type {
  MediaItemModel,
  MediaListModel,
  UploadMediaInput,
  UpdateMediaInput,
} from "./adapters/media.adapter";
export type {
  TemplateSummaryModel,
  FullTemplateModel,
  CreateTemplateInput,
} from "./adapters/template.adapter";
export type {
  SetEntitlementInput,
  SetEntitlementResultModel,
} from "./adapters/entitlement.adapter";
export type { ModuleSummaryModel } from "./adapters/module.adapter";
export type { UserModel, LoginInput } from "./adapters/auth.adapter";
export type { SavePageCommand } from "./usecases/SavePageUseCase";
export type { PublishPageCommand } from "./usecases/PublishPageUseCase";
export type { AssignPageToProjectCommand } from "./usecases/AssignPageToProjectUseCase";
export type { CreateSiteCommand } from "./usecases/CreateSiteUseCase";
export type { UpdateSitePaletteCommand } from "./usecases/UpdateSitePaletteUseCase";
export type { UploadMediaCommand } from "./usecases/UploadMediaUseCase";
export type { UpdateMediaCommand } from "./usecases/UpdateMediaUseCase";
export type { CreateTemplateCommand } from "./usecases/CreateTemplateUseCase";
export type { SetEntitlementCommand } from "./usecases/SetEntitlementUseCase";
export type { LoginCommand } from "./usecases/LoginUseCase";
