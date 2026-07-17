import { LandingContent } from "@/components/landing/landing-content";
import { paletteForTemplate } from "@/components/landing/showcase-palettes";
import type { ShowcaseSlide } from "@/components/landing/versatility-reel";
import { getSeededTemplateRepository } from "@/infrastructure/template/SeededTemplateRepository";

// Server component. The hero reel shows the *real* seeded template catalog, so
// the catalog is read here (infrastructure stays server-side, DDD layering
// intact) and handed to the client half as plain props.
//
// The seeded catalog is static data — no fs, no request access — so `/` still
// prerenders as a static route.
export default async function Home() {
  const templates = await getSeededTemplateRepository().findAll();

  const slides: ShowcaseSlide[] = templates.map((template) => ({
    id: template.id,
    name: template.name,
    category: template.category,
    html: template.html,
    css: template.css,
    palette: paletteForTemplate(template.id),
  }));

  return <LandingContent slides={slides} />;
}
