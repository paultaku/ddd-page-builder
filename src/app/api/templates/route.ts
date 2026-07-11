import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import {
  templateEntitlementKey,
  type Template,
  type TemplateCategory,
} from "@/domain/template/Template";
import { getTemplateRepository } from "@/infrastructure/template/templateRepository";
import { getUserTemplateRepository } from "@/infrastructure/template/FileTemplateRepository";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const CATEGORIES: TemplateCategory[] = [
  "business",
  "store",
  "product-detail",
  "company-landing",
  "one-page-product",
];

interface CreateTemplatePayload {
  name?: string;
  category?: TemplateCategory;
  html?: string;
  css?: string;
}

// Template catalog for the editor: metadata + current entitlement per template.
// Full html/css is fetched per-template on import (GET /api/templates/[id]).
export async function GET() {
  try {
    const templates = await getTemplateRepository().findAll();
    const entitlements = getEntitlementRepository();
    const list = await Promise.all(
      templates.map(async (t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        tier: t.tier,
        source: t.source,
        thumbnail: t.thumbnail,
        entitlement: await entitlements.getState(
          ANONYMOUS_OWNER_ID,
          templateEntitlementKey(t.id),
          t.tier
        ),
      }))
    );
    return NextResponse.json({ templates: list });
  } catch (error) {
    console.error("Error listing templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a user-authored template from the current page (T2). User templates
// are free and owned — never publish-gated.
export async function POST(request: NextRequest) {
  try {
    const body: CreateTemplatePayload = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }
    if (!body.html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }
    const category: TemplateCategory = CATEGORIES.includes(
      body.category as TemplateCategory
    )
      ? (body.category as TemplateCategory)
      : "business";

    const template: Template = {
      id: randomUUID(),
      name,
      category,
      tier: "free",
      source: "user",
      ownerId: ANONYMOUS_OWNER_ID,
      html: body.html,
      css: body.css ?? "",
    };
    await getUserTemplateRepository().save(template);
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
