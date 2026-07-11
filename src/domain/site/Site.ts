// Site aggregate (Site Management bounded context, extends publish/B).
//
// A Site is a set of pages generated from one template (a shared theme). MVP
// semantics (per T3 plan, decision "a"): pages are independent copies after
// generation — no live theme propagation. The Site is the grouping + public
// index; member pages are ordinary Pages, each publishable on its own.
export interface Site {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  pageIds: string[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  published: boolean;
}

export function normalizeSite(raw: Partial<Site> & { id: string }): Site {
  return {
    published: false,
    pageIds: [],
    ...raw,
    name: raw.name ?? "Untitled Site",
    ownerId: raw.ownerId ?? "anonymous",
    templateId: raw.templateId ?? "",
    createdAt: raw.createdAt ?? raw.updatedAt ?? new Date(0).toISOString(),
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  };
}
