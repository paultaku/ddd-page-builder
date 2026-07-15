import { normalizePalette, type ColorPalette } from "./ColorPalette";

// Site aggregate (Site Management bounded context, extends publish/B).
//
// A Site is a "project": a set of pages generated from one template, sharing a
// project-level theme. Member pages delegate to the Site's `colorPalette` — at
// render time it is emitted as CSS variables the pages' styles reference (see
// ColorPalette). Editing the palette reflows every assigned page. Membership is
// single-project: a page belongs to at most one Site.
export interface Site {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  pageIds: string[];
  colorPalette: ColorPalette;
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
    colorPalette: normalizePalette(raw.colorPalette),
    createdAt: raw.createdAt ?? raw.updatedAt ?? new Date(0).toISOString(),
    updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
  };
}
