# Prism — worklog

## 2026-10-31 — Holding page ("your feeds will be ready soon")

**Overview.** Prism had a README and a logo, no site. This adds the holding page: one headline,
one subtitle, no navigation, no app.

**What changed.**
- `index.html` — semantic `<main>` with a single `<h1>` and `<p>`; no chrome, no nav.
- `styles.css` — Geist Mono `@font-face` (local `assets/fonts/geist-mono/*.woff2`, no Google Fonts
  request), headline in the logo green `#64FA53`, subtitle in `#c6c6c6`, and the tesseract canvas
  reproduced exactly: `#0f0f0f` with `assets/noise.png` tiled at `200px`, `fixed`.
- `script.js` — a pointer "sheen": a soft green-tinted radial light that eases toward the cursor
  on `requestAnimationFrame` and fades in on first movement. Skipped entirely for
  `prefers-reduced-motion` and for coarse pointers/touch.

**Decisions.**
- Values are hardcoded, not tokenised. This is one page with one palette; a token layer would be
  scaffolding for a design system that does not exist yet.
- "Nitrox dark grey" was read as *the tesseract background*, since that is the live reference:
  `--tess-obsidian` `#0f0f0f` plus the neutral noise PNG. `.grainy-background` in tesseract also
  carries a `#373737` variant, which looks markedly lighter over grain — not used.
- Copy typos in the brief were corrected (upadtes → updates, streamlineing → streamlining).
- Logo is *not* in the page. The brief asked for headline + subtitle only.

**Validation.**
- Served locally and checked at 1440×900 and 390×844 in the browser panel: type renders in Geist
  Mono, grain tiles without banding, headline wraps to two balanced lines on both sizes.
- Not checked: Safari/Firefox rendering, and whether Geist Mono's variable `.woff2` loads from a
  `file://` open (CSS `url()` with `[wght]` brackets is fine over HTTP, untested over file).

**Follow-ups.** Real favicons/social preview image; decide whether the page needs the prism mark as a
small anchor above the headline.

— Model: DeepSeek V4.1 Flash Free (opencode, provider: opencode)
