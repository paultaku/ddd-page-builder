import type { Template } from "@/domain/template/Template";
import type { TemplateRepository } from "@/domain/template/TemplateRepository";

// Shared self-contained utility CSS for the seeded templates. Kept small and
// explicit so imported/published pages render without the Tailwind CDN (same
// constraint as the publish route).
const BASE_CSS = `
.container { max-width: 1120px; margin: 0 auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.font-bold { font-weight: 700; }
.text-gray-800 { color: #1f2937; }
.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-center { text-align: center; }
.flex { display: flex; }
.gap-4 { gap: 1rem; }
.grid { display: grid; }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.price { font-size: 1.5rem; font-weight: 700; color: #16a34a; }
.btn-buy { display: inline-block; background-color: #16a34a; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 700; }
`.trim();

// Seeded template catalog: one per category. `store`, `product-detail` and the
// commerce `one-page-product` are paid (publish-gated in trial); the rest free.
const TEMPLATES: Omit<Template, "source">[] = [
  {
    id: "business-basic",
    name: "Business Starter",
    category: "business",
    tier: "free",
    html: `<section class="container mx-auto px-4 py-16">
  <h1 class="text-4xl font-bold text-gray-800 mb-4">Your business, online.</h1>
  <p class="text-gray-600 mb-8">A clean starting point for a services business.</p>
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Service one</h2><p class="text-gray-600">Describe it here.</p></div>
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Service two</h2><p class="text-gray-600">Describe it here.</p></div>
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Service three</h2><p class="text-gray-600">Describe it here.</p></div>
  </div>
</section>`,
    css: BASE_CSS,
  },
  {
    id: "store-grid",
    name: "Store Front",
    category: "store",
    tier: "paid",
    html: `<section class="container mx-auto px-4 py-16">
  <h1 class="text-3xl font-bold text-gray-800 mb-8">Shop</h1>
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Product A</h2><p class="price mb-4">$19</p></div>
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Product B</h2><p class="price mb-4">$29</p></div>
    <div class="bg-white rounded-lg shadow-md p-6"><h2 class="text-xl font-bold text-gray-800 mb-2">Product C</h2><p class="price mb-4">$39</p></div>
  </div>
</section>`,
    css: BASE_CSS,
  },
  {
    id: "product-detail",
    name: "Product Detail",
    category: "product-detail",
    tier: "paid",
    html: `<section class="container mx-auto px-4 py-16">
  <div class="flex gap-4">
    <div class="bg-gray-100 rounded-lg p-8" style="flex:1;min-height:280px"></div>
    <div class="p-8" style="flex:1">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Product name</h1>
      <p class="text-gray-600 mb-8">A longer description of the product and its benefits.</p>
      <p class="price mb-8">$49</p>
    </div>
  </div>
</section>`,
    css: BASE_CSS,
  },
  {
    id: "company-landing",
    name: "Company Landing",
    category: "company-landing",
    tier: "free",
    html: `<section class="container mx-auto px-4 py-16 text-center">
  <h1 class="text-4xl font-bold text-gray-800 mb-4">We build great things</h1>
  <p class="text-gray-600 mb-8">A company landing page to introduce your team and mission.</p>
  <div class="bg-white rounded-lg shadow-md p-8"><p class="text-gray-600">About us — tell your story here.</p></div>
</section>`,
    css: BASE_CSS,
  },
  {
    id: "one-page-product",
    name: "One-Page Product Site",
    category: "one-page-product",
    tier: "paid",
    html: `<section class="container mx-auto px-4 py-16 text-center">
  <h1 class="text-4xl font-bold text-gray-800 mb-4">The only product you need</h1>
  <p class="text-gray-600 mb-8">One page, one product, one call to action.</p>
  <p class="price mb-8">$99</p>
  <a data-commerce-cta href="#" class="btn-buy">Buy now</a>
</section>`,
    css: BASE_CSS,
  },
];

const withSource = (t: Omit<Template, "source">): Template => ({
  ...t,
  source: "seed",
});

export class SeededTemplateRepository implements TemplateRepository {
  async findAll(): Promise<Template[]> {
    return TEMPLATES.map(withSource);
  }
  async findById(id: string): Promise<Template | null> {
    const found = TEMPLATES.find((t) => t.id === id);
    return found ? withSource(found) : null;
  }
}

let repository: TemplateRepository | null = null;
export function getSeededTemplateRepository(): TemplateRepository {
  if (!repository) repository = new SeededTemplateRepository();
  return repository;
}
