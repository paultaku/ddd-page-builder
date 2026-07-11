import { getTemplateRepository } from "@/infrastructure/template/templateRepository";

export const runtime = "nodejs";

// Main-application pricing page, rendered from the seeded "pricing-page"
// template so the marketing route and the builder template stay in sync.
export default async function PricingPage() {
  const template = await getTemplateRepository().findById("pricing-page");

  if (!template) {
    return (
      <main className="p-8 text-center text-gray-600">
        Pricing is unavailable right now.
      </main>
    );
  }

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: template.css }} />
      <div dangerouslySetInnerHTML={{ __html: template.html }} />
    </main>
  );
}
