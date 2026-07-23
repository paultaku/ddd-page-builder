// Persistence driver selection. The single knob that swaps the concrete
// repository adapters behind the (unchanged) domain ports. Default is "file" so
// the app behaves exactly as before unless PERSISTENCE is set explicitly.
//
// Adding a new backend later (e.g. "mongodb") is additive: extend this union,
// add a case in each getXRepository() factory, and write the adapters. No route
// or caller changes.
export type PersistenceDriver = "file" | "sqlite"; // "mongodb" added later

export function getPersistenceDriver(): PersistenceDriver {
  const v = process.env.PERSISTENCE?.toLowerCase();
  return v === "sqlite" ? "sqlite" : "file"; // default file (safe, current behavior)
}
