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
  // Publishing (Site Management). A page is private until explicitly published;
  // the public render route serves it only while `published` is true.
  published: boolean;
  publishedAt?: string; // ISO8601
  slug?: string;
  // Provenance: the template this page was created from (T1). Absent for blank
  // or legacy pages.
  templateId?: string;
  // Commerce (T4): outbound purchase/checkout link injected into the page's
  // `data-commerce-cta` button at render time. No payment processing.
  purchaseUrl?: string;
}

// Coerce a persisted record (possibly written before a field existed) into a
// complete Page. Keeps the deferred-DB file store forward-compatible.
export function normalizePage(raw: Partial<Page> & { uuid: string }): Page {
  return {
    published: false,
    css: "",
    ...raw,
    title: raw.title ?? "Untitled Page",
    html: raw.html ?? "",
    ownerId: raw.ownerId ?? ANONYMOUS_OWNER_ID,
    createdAt: raw.createdAt ?? raw.updatedAt ?? new Date(0).toISOString(),
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  };
}

// Auth is deferred; every page is owned by a single anonymous owner for now.
// The field exists in the model so wiring real auth later is additive.
export const ANONYMOUS_OWNER_ID = "anonymous";
