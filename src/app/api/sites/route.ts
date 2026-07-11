import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ANONYMOUS_OWNER_ID, type Page } from "@/domain/page/Page";
import type { Site } from "@/domain/site/Site";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getTemplateRepository } from "@/infrastructure/template/templateRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";

export const runtime = "nodejs";

interface CreateSitePayload {
  name?: string;
  templateId?: string;
  pages?: Array<{ title?: string }>;
}

// Create a Site from a template: generate one Page per entry, each seeded from
// the template (MVP: independent copies — no live theme propagation).
export async function POST(request: NextRequest) {
  try {
    const body: CreateSitePayload = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Site name is required" }, { status: 400 });
    }
    if (!body.templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }
    const template = await getTemplateRepository().findById(body.templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const entries =
      body.pages && body.pages.length > 0 ? body.pages : [{ title: name }];

    const pageRepo = getPageRepository();
    const now = new Date().toISOString();
    const pageIds: string[] = [];
    for (const entry of entries) {
      const page: Page = {
        uuid: randomUUID(),
        title: entry.title?.trim() || "Untitled Page",
        html: template.html,
        css: template.css,
        ownerId: ANONYMOUS_OWNER_ID,
        createdAt: now,
        updatedAt: now,
        published: false,
        templateId: template.id,
      };
      await pageRepo.save(page);
      pageIds.push(page.uuid);
    }

    const site: Site = {
      id: randomUUID(),
      name,
      ownerId: ANONYMOUS_OWNER_ID,
      templateId: template.id,
      pageIds,
      createdAt: now,
      updatedAt: now,
      published: false,
    };
    await getSiteRepository().save(site);

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// List the anonymous owner's sites.
export async function GET() {
  try {
    const sites = await getSiteRepository().listByOwner(ANONYMOUS_OWNER_ID);
    return NextResponse.json({
      sites: sites.map((s) => ({
        id: s.id,
        name: s.name,
        pageCount: s.pageIds.length,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error listing sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
