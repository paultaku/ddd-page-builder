// Purchase-link rendering (T4). A one-page product site's buy CTA is marked in
// HTML with `data-commerce-cta`; the page's stored `purchaseUrl` is injected
// into that anchor's href at render time (public page, preview, export).
//
// `purchaseUrl` is untrusted input: only http(s) URLs are allowed, everything
// else (javascript:, data:, malformed) collapses to a safe no-op ("#").

export function sanitizePurchaseUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

// Escape for use inside a double-quoted HTML attribute.
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Inject the (sanitized) purchase URL into every `data-commerce-cta` anchor's
// href. Unsafe/absent URLs render as "#" so the CTA is never a live unsafe link.
export function injectPurchaseUrl(
  html: string,
  url: string | null | undefined
): string {
  const safe = sanitizePurchaseUrl(url) ?? "#";
  const hrefValue = escapeAttr(safe);
  // Match any <a ...> tag that carries the data-commerce-cta marker.
  return html.replace(/<a\b[^>]*\bdata-commerce-cta\b[^>]*>/gi, (tag) => {
    if (/\shref\s*=\s*"[^"]*"/i.test(tag)) {
      return tag.replace(/(\shref\s*=\s*")[^"]*(")/i, `$1${hrefValue}$2`);
    }
    // No href present — add one before the tag closes.
    return tag.replace(/\s*>$/, ` href="${hrefValue}">`);
  });
}
