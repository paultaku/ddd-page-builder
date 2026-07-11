import type { Module } from "@/domain/module-catalog/Module";

// Seeded Module Catalog. Small on purpose (per plan): wrap a handful of blocks,
// mark some paid, prove the mechanism. Each block carries a `data-module`
// marker so a stored page reveals which modules it uses. Styling relies on the
// default utility CSS already emitted by the editor.
export const MODULE_CATALOG: Module[] = [
  {
    id: "hero-basic",
    name: "Hero Section",
    category: "layout",
    tier: "free",
    marker: 'data-module="hero-basic"',
    blockHtml: `<section data-module="hero-basic" class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-800 mb-4">Your headline here</h1>
  <p class="text-gray-600 mb-4">A short supporting sentence for your hero section.</p>
</section>`,
  },
  {
    id: "feature-grid",
    name: "Feature Grid",
    category: "content",
    tier: "free",
    marker: 'data-module="feature-grid"',
    blockHtml: `<section data-module="feature-grid" class="container mx-auto px-4 py-8">
  <div class="flex gap-4">
    <div class="bg-white rounded-lg shadow-md p-6">Feature one</div>
    <div class="bg-white rounded-lg shadow-md p-6">Feature two</div>
    <div class="bg-white rounded-lg shadow-md p-6">Feature three</div>
  </div>
</section>`,
  },
  {
    id: "carousel",
    name: "Carousel",
    category: "media",
    tier: "free",
    marker: 'data-module="carousel"',
    // Carousel mechanics (horizontal scroll + snap) use inline styles so the
    // block renders self-contained in published pages, which ship no JS and only
    // the page's own CSS. Card look reuses the shared utility classes.
    blockHtml: `<section data-module="carousel" class="container mx-auto px-4 py-8">
  <div style="display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:0.5rem">
    <div class="bg-white rounded-lg shadow-md p-6" style="flex:0 0 80%;scroll-snap-align:start;min-height:160px">
      <h3 class="text-xl font-bold text-gray-800 mb-2">Slide one</h3>
      <p class="text-gray-600">Add your content here.</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6" style="flex:0 0 80%;scroll-snap-align:start;min-height:160px">
      <h3 class="text-xl font-bold text-gray-800 mb-2">Slide two</h3>
      <p class="text-gray-600">Add your content here.</p>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6" style="flex:0 0 80%;scroll-snap-align:start;min-height:160px">
      <h3 class="text-xl font-bold text-gray-800 mb-2">Slide three</h3>
      <p class="text-gray-600">Add your content here.</p>
    </div>
  </div>
</section>`,
  },
  {
    id: "pricing-table",
    name: "Pricing Table",
    category: "commerce",
    tier: "paid",
    marker: 'data-module="pricing-table"',
    blockHtml: `<section data-module="pricing-table" class="container mx-auto px-4 py-8">
  <div class="flex gap-4">
    <div class="bg-white rounded-lg shadow-md p-6">Starter — $0</div>
    <div class="bg-white rounded-lg shadow-md p-6">Pro — $19</div>
    <div class="bg-white rounded-lg shadow-md p-6">Business — $49</div>
  </div>
</section>`,
  },
  {
    id: "contact-form",
    name: "Contact Form",
    category: "commerce",
    tier: "paid",
    marker: 'data-module="contact-form"',
    blockHtml: `<section data-module="contact-form" class="container mx-auto px-4 py-8">
  <div class="bg-white rounded-lg shadow-md p-6">
    <p class="text-gray-800 mb-4">Contact us</p>
  </div>
</section>`,
  },
];

export function getModuleCatalog(): Module[] {
  return MODULE_CATALOG;
}

export function findModuleById(id: string): Module | undefined {
  return MODULE_CATALOG.find((m) => m.id === id);
}
