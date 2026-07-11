import Link from "next/link";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";
import { CreateSiteForm } from "@/components/create-site-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const sites = await getSiteRepository().listByOwner(ANONYMOUS_OWNER_ID);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">My Sites</h1>
          <Link
            href="/pages"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            My Pages
          </Link>
        </div>

        <CreateSiteForm />

        {sites.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No sites yet. Create one from a template above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {sites.map((site) => (
              <li
                key={site.id}
                className="flex items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800">
                    {site.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {site.pageIds.length} page
                    {site.pageIds.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  href={`/s/${site.id}`}
                  className="ml-4 shrink-0 text-sm font-medium text-blue-600 hover:underline"
                >
                  View site
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
