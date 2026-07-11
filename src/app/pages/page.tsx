import Link from "next/link";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PagesListPage() {
  const pages = await getPageRepository().listByOwner(ANONYMOUS_OWNER_ID);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">My Pages</h1>
          <Link
            href="/editor"
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            New Page
          </Link>
        </div>

        {pages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No saved pages yet. Create one in the editor and hit Save.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {pages.map((page) => (
              <li key={page.uuid}>
                <Link
                  href={`/editor?uuid=${page.uuid}`}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">
                      {page.title || "Untitled Page"}
                    </p>
                    <p className="truncate text-xs text-gray-400">{page.uuid}</p>
                  </div>
                  <span className="ml-4 shrink-0 text-sm text-gray-500">
                    {new Date(page.updatedAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
