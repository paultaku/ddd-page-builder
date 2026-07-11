// Page aggregate (Page Composition bounded context).
//
// Identity is the stable UUID minted by the editor. `css` is stored alongside
// `html` so a page can be re-rendered faithfully outside the editor (e.g. the
// public publish route) without depending on the GrapeJS runtime.
export interface Page {
  uuid: string;
  title: string;
  html: string;
  css: string;
  ownerId: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// Auth is deferred; every page is owned by a single anonymous owner for now.
// The field exists in the model so wiring real auth later is additive.
export const ANONYMOUS_OWNER_ID = "anonymous";
