/**
 * One-shot migration: import the existing .data/*.json file store into SQLite.
 *
 * Reads every aggregate via the FILE adapters and writes via the SQLITE adapters
 * (both instantiated directly — this is the one place both drivers coexist in a
 * single process, so we bypass the driver-aware factories). Idempotent: every
 * Sqlite adapter upserts, so re-running is safe. The .data/*.json files are left
 * intact for rollback.
 *
 *   npx tsx scripts/migrate-to-sqlite.mts            # migrate
 *   npx tsx scripts/migrate-to-sqlite.mts --dry-run  # count only, no writes
 */
import { promises as fs } from "fs";
import path from "path";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import type { EntitlementState } from "@/domain/module-catalog/Entitlement";
import { FilePageRepository } from "@/infrastructure/page/FilePageRepository";
import { SqlitePageRepository } from "@/infrastructure/page/SqlitePageRepository";
import { FileSiteRepository } from "@/infrastructure/site/FileSiteRepository";
import { SqliteSiteRepository } from "@/infrastructure/site/SqliteSiteRepository";
import { FileMediaRepository } from "@/infrastructure/media/FileMediaRepository";
import { SqliteMediaRepository } from "@/infrastructure/media/SqliteMediaRepository";
import { SqliteEntitlementRepository } from "@/infrastructure/module-catalog/SqliteEntitlementRepository";
import { FileTemplateRepository } from "@/infrastructure/template/FileTemplateRepository";
import { SqliteTemplateRepository } from "@/infrastructure/template/SqliteTemplateRepository";

const DRY_RUN = process.argv.includes("--dry-run");
const DATA_DIR = path.join(process.cwd(), ".data");

type OwnerStates = Record<string, EntitlementState>;

async function readEntitlementFiles(): Promise<
  Array<{ ownerId: string; moduleKey: string; state: EntitlementState }>
> {
  const dir = path.join(DATA_DIR, "entitlements");
  const out: Array<{
    ownerId: string;
    moduleKey: string;
    state: EntitlementState;
  }> = [];
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return out; // no entitlements stored yet
  }
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const ownerId = file.replace(/\.json$/, "");
    try {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const states = JSON.parse(raw) as OwnerStates;
      for (const [moduleKey, state] of Object.entries(states)) {
        out.push({ ownerId, moduleKey, state });
      }
    } catch {
      // skip corrupt
    }
  }
  return out;
}

async function main() {
  const filePages = new FilePageRepository();
  const fileSites = new FileSiteRepository();
  const fileMedia = new FileMediaRepository();
  const fileTemplates = new FileTemplateRepository();

  const sqlPages = new SqlitePageRepository();
  const sqlSites = new SqliteSiteRepository();
  const sqlMedia = new SqliteMediaRepository();
  const sqlEntitlements = new SqliteEntitlementRepository();
  const sqlTemplates = new SqliteTemplateRepository();

  // Collect from the file store.
  const pages = await filePages.listByOwner(ANONYMOUS_OWNER_ID);
  const sites = await fileSites.listByOwner(ANONYMOUS_OWNER_ID);
  const mediaItems = await fileMedia.listItems(ANONYMOUS_OWNER_ID);
  const categories = await fileMedia.listCategories();
  const entitlements = await readEntitlementFiles();
  const userTemplates = await fileTemplates.findAll();

  const counts = {
    pages: pages.length,
    sites: sites.length,
    media: mediaItems.length,
    mediaCategories: categories.length,
    entitlements: entitlements.length,
    userTemplates: userTemplates.length,
  };

  if (DRY_RUN) {
    console.log("[dry-run] would migrate (no writes):");
    console.table(counts);
    return;
  }

  for (const page of pages) await sqlPages.save(page);
  for (const site of sites) await sqlSites.save(site);
  for (const item of mediaItems) await sqlMedia.saveItem(item);
  for (const name of categories) await sqlMedia.addCategory(name);
  for (const e of entitlements)
    await sqlEntitlements.setState(e.ownerId, e.moduleKey, e.state);
  for (const t of userTemplates) await sqlTemplates.save(t);

  console.log("Migration complete. Migrated into .data/app.db:");
  console.table(counts);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
