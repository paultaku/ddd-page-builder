// DI composition root for the client-side API layer.
//
// Repositories are instantiated once and injected into the UseCases. Components
// import the ready-to-use UseCase singletons from here and never touch fetch,
// repositories, adapters, or schemas directly. Swapping a repository (e.g. a
// mock in tests) means re-wiring only this file.
import { PageApiRepository } from "./repositories/PageApiRepository";
import { SiteApiRepository } from "./repositories/SiteApiRepository";
import { ListPagesUseCase } from "./usecases/ListPagesUseCase";
import { GetPageUseCase } from "./usecases/GetPageUseCase";
import { SavePageUseCase } from "./usecases/SavePageUseCase";
import { PublishPageUseCase } from "./usecases/PublishPageUseCase";
import { AssignPageToProjectUseCase } from "./usecases/AssignPageToProjectUseCase";
import { ListSitesUseCase } from "./usecases/ListSitesUseCase";
import { CreateSiteUseCase } from "./usecases/CreateSiteUseCase";
import { GetSiteUseCase } from "./usecases/GetSiteUseCase";
import { UpdateSitePaletteUseCase } from "./usecases/UpdateSitePaletteUseCase";

// --- Composition: repositories (transport singletons) ----------------------
const pageRepository = new PageApiRepository();
const siteRepository = new SiteApiRepository();

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

// --- Transport + typed errors ---------------------------------------------
export { ApiError } from "./http";
export { PublishBlockedError } from "./usecases/PublishPageUseCase";

// --- Classes (for custom composition / tests) ------------------------------
export { PageApiRepository } from "./repositories/PageApiRepository";
export { SiteApiRepository } from "./repositories/SiteApiRepository";
export { ListPagesUseCase } from "./usecases/ListPagesUseCase";
export { GetPageUseCase } from "./usecases/GetPageUseCase";
export { SavePageUseCase } from "./usecases/SavePageUseCase";
export { PublishPageUseCase } from "./usecases/PublishPageUseCase";
export { AssignPageToProjectUseCase } from "./usecases/AssignPageToProjectUseCase";
export { ListSitesUseCase } from "./usecases/ListSitesUseCase";
export { CreateSiteUseCase } from "./usecases/CreateSiteUseCase";
export { GetSiteUseCase } from "./usecases/GetSiteUseCase";
export { UpdateSitePaletteUseCase } from "./usecases/UpdateSitePaletteUseCase";

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
export type { SavePageCommand } from "./usecases/SavePageUseCase";
export type { PublishPageCommand } from "./usecases/PublishPageUseCase";
export type { AssignPageToProjectCommand } from "./usecases/AssignPageToProjectUseCase";
export type { CreateSiteCommand } from "./usecases/CreateSiteUseCase";
export type { UpdateSitePaletteCommand } from "./usecases/UpdateSitePaletteUseCase";
