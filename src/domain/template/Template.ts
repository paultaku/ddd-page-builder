import type { ModuleTier } from "@/domain/module-catalog/Module";

// Template bounded context.
//
// A Template is a platform-owned, reusable *whole-page* scaffold — distinct from
// a Module (a single block). Importing a template seeds the editor canvas as a
// starting point; the page then records which template it came from.
export type TemplateCategory =
  | "business"
  | "store"
  | "product-detail"
  | "company-landing"
  | "one-page-product";

// Where a template came from: a curated in-repo seed, or one a user saved from
// their own page (T2). User templates are owned and never publish-gated.
export type TemplateSource = "seed" | "user";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  // Reuse the module tier vocabulary so paid templates plug into the same
  // entitlement machine.
  tier: ModuleTier;
  source: TemplateSource;
  ownerId?: string;
  thumbnail?: string;
  html: string;
  css: string;
}

// Namespaced entitlement key: paid templates share the module entitlement store
// without colliding with module ids.
export function templateEntitlementKey(templateId: string): string {
  return `tpl:${templateId}`;
}
