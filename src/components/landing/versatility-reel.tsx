"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { paletteToCssVars, type ColorPalette } from "@/domain/site/ColorPalette";
import { useI18n } from "@/i18n/use-i18n";

// Presentation-only projection of a seeded Template, built on the server and
// handed down as props so infrastructure never reaches the client bundle.
export type ShowcaseSlide = {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  palette: ColorPalette;
};

// The reel renders each slide inside an `<iframe srcDoc>` rather than inline.
// The seeded BASE_CSS defines global-ish selectors (`.container`, `.btn`,
// `.text-4xl`, `.grid-cols-3`) that would collide with the landing page's
// Tailwind. The iframe gives real style isolation, and lets the palette be
// injected on `:root` exactly the way `/p/[uuid]/route.ts` does — so the reel
// exercises the true publish render path instead of imitating it.
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 800;
const SLIDE_MS = 3500;
const FADE_MS = 400;

function slideDoc(slide: ShowcaseSlide): string {
  // Mirrors the publish route: palette vars first, then the page CSS, so any
  // `var(--color-*)` reference in the seeded markup takes the slide's theme.
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${paletteToCssVars(slide.palette)}
${slide.css}
html, body { margin: 0; background: ${slide.palette.background}; color: ${slide.palette.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }</style>
</head>
<body>${slide.html}</body>
</html>`;
}

export function VersatilityReel({ slides }: { slides: ShowcaseSlide[] }) {
  const { t } = useI18n();

  // `active` is the logical slide; `shown` is what the iframe currently holds.
  // They diverge only for the length of the cross-fade.
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [opaque, setOpaque] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [scale, setScale] = useState(0.35);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Reduced motion: no autoplay, first slide static. Read after mount so the
  // server and first client render agree.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Scale the 1280x800 frame down to whatever width the hero gives us.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / FRAME_WIDTH);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Autoplay. Suspended while paused, while reduced-motion is on, and when the
  // reel is off-screen (no point animating what nobody is looking at).
  useEffect(() => {
    if (reduced || paused || slides.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      SLIDE_MS
    );
    return () => clearInterval(id);
  }, [reduced, paused, slides.length]);

  // Cross-fade: fade the frame out, swap `srcDoc`, fade back in. Under reduced
  // motion the swap is instant.
  useEffect(() => {
    if (active === shown) return;
    if (reduced) {
      setShown(active);
      return;
    }
    setOpaque(false);
    const id = setTimeout(() => {
      setShown(active);
      setOpaque(true);
    }, FADE_MS);
    return () => clearTimeout(id);
  }, [active, shown, reduced]);

  const goTo = useCallback((index: number) => {
    setActive(index);
    setPaused(true); // an explicit choice wins over the timer
  }, []);

  if (slides.length === 0) return null;

  const current = slides[shown];
  const caption = t(`home.reel.caption.${current.id}`);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Browser frame */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl shadow-indigo-950/10 ring-1 ring-black/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 bg-gray-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="mx-auto flex min-w-0 max-w-xs flex-1 items-center justify-center rounded-md bg-white px-3 py-1 text-xs text-gray-400 ring-1 ring-gray-200/80">
            <span
              className="truncate transition-opacity duration-300"
              style={{ opacity: opaque ? 1 : 0 }}
            >
              yoursite.com/{current.category}
            </span>
          </div>
          {/* WCAG 2.2.2 — autoplay longer than 5s needs a pause control.
              Under reduced motion nothing autoplays, so the control is moot. */}
          {!reduced && slides.length > 1 ? (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? t("home.reel.play") : t("home.reel.pause")}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {paused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="h-3.5 w-7" aria-hidden="true" />
          )}
        </div>

        {/* Scaled viewport. One iframe, srcDoc swapped per slide — seven live
            iframes would be needlessly heavy. */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden bg-white"
          style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
        >
          <iframe
            key={current.id}
            title={current.name}
            aria-hidden="true"
            tabIndex={-1}
            sandbox=""
            srcDoc={slideDoc(current)}
            className="absolute left-0 top-0 border-0 transition-opacity ease-out"
            style={{
              width: FRAME_WIDTH,
              height: FRAME_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
              opacity: opaque ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        </div>
      </div>

      {/* Caption + dots. `aria-live` announces the rotation to screen readers,
          which never see the decorative iframe. */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <p
          aria-live="polite"
          className="text-center text-sm font-medium text-gray-500 transition-opacity duration-300"
          style={{ opacity: opaque ? 1 : 0 }}
        >
          <span className="text-gray-900">{current.name}</span>
          <span className="mx-2 text-gray-300">·</span>
          {caption}
        </p>

        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${t("home.reel.show")} ${slide.name}`}
              aria-current={i === active ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                i === active
                  ? "w-6 bg-gray-800"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
