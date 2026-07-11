// Module Catalog bounded context.
//
// A Module is the platform-owned wrapper around an editor block. Wrapping (vs.
// using GrapeJS's built-in blocks directly) gives the catalog a surface the
// platform owns — the attachment point for tiering, upsell, and a future
// marketplace. Each module carries a `marker` that appears in its rendered
// HTML so usage can be detected in a stored page.
export type ModuleTier = "free" | "paid";

export interface Module {
  id: string;
  name: string;
  category: string;
  tier: ModuleTier;
  // Substring guaranteed to appear in the module's HTML once placed.
  marker: string;
  // HTML inserted into the editor canvas when the module is placed.
  blockHtml: string;
}

// Detect which catalog modules a page uses by scanning its stored HTML.
export function findUsedModules(html: string, catalog: Module[]): Module[] {
  return catalog.filter((m) => html.includes(m.marker));
}
