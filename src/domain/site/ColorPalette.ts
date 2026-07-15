// Project-level theme (Site Management bounded context).
//
// A ColorPalette is a named set of theme colors owned by a Site ("project").
// Pages that belong to the Site *delegate* to it: at render time the palette is
// emitted as CSS custom properties (`--color-*`) on `:root`, so a page whose
// CSS/HTML references `var(--color-primary)` reflows live whenever the project
// palette changes. No value is copied into the page — the delegation is by
// reference through the cascade.
export interface ColorPalette {
  primary: string; // buttons, links, primary actions
  secondary: string; // secondary actions / accents
  accent: string; // commerce CTA, price highlights
  background: string; // page surface
  text: string; // body text
}

// The neutral default. Chosen to match the seeded templates' existing look, so
// a project with no explicit palette renders exactly as before.
export const DEFAULT_PALETTE: ColorPalette = {
  primary: "#3b82f6",
  secondary: "#6366f1",
  accent: "#16a34a",
  background: "#ffffff",
  text: "#1f2937",
};

// The CSS custom-property name each slot is emitted as.
export const PALETTE_CSS_VARS: Record<keyof ColorPalette, string> = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  accent: "--color-accent",
  background: "--color-bg",
  text: "--color-text",
};

// Palette values are untrusted (user-editable) and are injected verbatim into a
// `<style>` block at render. Restrict to hex colors (#rgb / #rrggbb / #rrggbbaa)
// so a value can never break out of the declaration and inject arbitrary CSS.
// Anything else collapses to the default for that slot.
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function sanitizeColor(
  value: string | null | undefined,
  fallback: string
): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return HEX_COLOR.test(trimmed) ? trimmed : fallback;
}

// Coerce a persisted/partial palette into a complete, sanitized ColorPalette.
// Keeps the file store forward-compatible and guarantees safe CSS output.
export function normalizePalette(
  raw: Partial<ColorPalette> | null | undefined
): ColorPalette {
  const src = raw ?? {};
  return {
    primary: sanitizeColor(src.primary, DEFAULT_PALETTE.primary),
    secondary: sanitizeColor(src.secondary, DEFAULT_PALETTE.secondary),
    accent: sanitizeColor(src.accent, DEFAULT_PALETTE.accent),
    background: sanitizeColor(src.background, DEFAULT_PALETTE.background),
    text: sanitizeColor(src.text, DEFAULT_PALETTE.text),
  };
}

// Render the palette as a `:root { --color-*: … }` rule. Values are already
// hex-sanitized by normalizePalette; callers should pass a normalized palette.
export function paletteToCssVars(palette: ColorPalette): string {
  const decls = (Object.keys(PALETTE_CSS_VARS) as Array<keyof ColorPalette>)
    .map((slot) => `${PALETTE_CSS_VARS[slot]}: ${palette[slot]};`)
    .join(" ");
  return `:root { ${decls} }`;
}
