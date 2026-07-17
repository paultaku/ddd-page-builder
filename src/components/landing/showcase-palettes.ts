import {
  DEFAULT_PALETTE,
  normalizePalette,
  type ColorPalette,
} from "@/domain/site/ColorPalette";

// Presentation-only showcase palettes for the landing hero reel.
//
// These are *not* domain defaults — they exist so each seeded template in the
// reel arrives wearing a different theme, demonstrating the project palette
// delegation (PR #19) on real catalog markup. `DEFAULT_PALETTE` stays untouched.
//
// Backgrounds stay light: the seeded BASE_CSS hardcodes `.bg-white` / `.bg-gray-100`
// surfaces, so only the page canvas and body text follow `--color-bg` / `--color-text`.
// `--color-primary` (`.btn`) and `--color-accent` (`.price`, `.btn-buy`) are the
// slots that visibly move per slide.
const RAW_PALETTES: Record<string, ColorPalette> = {
  // Business Starter — trustworthy indigo on cool paper.
  "business-basic": {
    primary: "#4f46e5",
    secondary: "#6366f1",
    accent: "#0ea5e9",
    background: "#f8fafc",
    text: "#1e293b",
  },
  // Store Front — retail warmth; amber CTA, rose price tags.
  "store-grid": {
    primary: "#d97706",
    secondary: "#f59e0b",
    accent: "#e11d48",
    background: "#fffbf5",
    text: "#292524",
  },
  // Product Detail — editorial charcoal with an emerald price.
  "product-detail": {
    primary: "#0f172a",
    secondary: "#334155",
    accent: "#059669",
    background: "#f5f5f4",
    text: "#1c1917",
  },
  // Company Landing — corporate navy and teal.
  "company-landing": {
    primary: "#0e7490",
    secondary: "#0891b2",
    accent: "#0d9488",
    background: "#f0fdfa",
    text: "#134e4a",
  },
  // One-Page Product Site — launch-day violet.
  "one-page-product": {
    primary: "#7c3aed",
    secondary: "#a855f7",
    accent: "#db2777",
    background: "#faf5ff",
    text: "#3b0764",
  },
  // Pricing Page — classic SaaS blue with a green "yes".
  "pricing-page": {
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#16a34a",
    background: "#f8fafc",
    text: "#1e3a8a",
  },
  // Contact Us — approachable teal with an orange send.
  "contact-us": {
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#ea580c",
    background: "#f7fefc",
    text: "#134e4a",
  },
};

// Normalize through the domain so every value is hex-sanitized before it is
// injected into a `<style>` block, exactly like a persisted project palette.
export const SHOWCASE_PALETTES: Record<string, ColorPalette> = Object.fromEntries(
  Object.entries(RAW_PALETTES).map(([id, palette]) => [
    id,
    normalizePalette(palette),
  ])
);

// Any template without a showcase palette (e.g. a future seed) renders in the
// neutral default rather than breaking the reel.
export function paletteForTemplate(templateId: string): ColorPalette {
  return SHOWCASE_PALETTES[templateId] ?? DEFAULT_PALETTE;
}
