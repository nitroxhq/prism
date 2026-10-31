# Plan: fix the reload jump + move the palette into CSS variables

- Goal: the holding page's text sits in the same place on every load, and the colours/sizes live in
  `:root` variables instead of being sprinkled through the rules.
- Status: draft — waiting on approval (and on one DevTools reading from the user's browser).
- Assumptions:
  - The jump is *load-time* (reload / first open), not caused by resizing the window mid-session.
    **Unverified** — see Unknowns.
  - "No tokens" meant "don't build a design-token system", not "don't use CSS variables". Variables
    are wanted, per the follow-up message.
- Unknowns:
  - Cannot reproduce in the OpenChamber browser panel: I slowed the font to 500ms and measured
    `main`'s top at parse time (fallback font) and after load (Geist Mono) — both `top=426`,
    `h1h=106`, `ph=105`. The fallback stack on this machine has the same `0`-advance as Geist Mono,
    so line breaks don't change. The user's Chrome at 60% zoom on localhost:8000 still jumps.
  - Which element actually moves is unknown without a `layout-shift` reading from their browser.

## What is unstable today

| # | Cause | Where | Why it moves the text |
|---|-------|-------|-----------------------|
| A | Entrance animation with a vertical transform | `styles.css:55`, `:108–118` (`@keyframes settle`) | The block is painted 10px low and rises over 900ms. Whether you catch it depends on paint timing, so the same page looks different reload to reload. This is the only thing in the CSS that *moves* centered text by design. |
| B | Scrollbar appearing / disappearing during load | `styles.css:38–39`, `:47` | `min-height: 100vh`→`100svh` plus `overflow-x: hidden`. If anything (a reflow, subpixel rounding, browser UI) makes the document 1px taller than the viewport, a scrollbar appears, the layout viewport narrows, and a centered block's position changes. |
| C | Web-font swap | `styles.css:11`, `:19` (`font-display: swap`) | Fallback metrics render first, then Geist Mono swaps in. `max-width: 54ch` is re-resolved against the new font, so wraps — and therefore the block height — can change after first paint. Measured as a no-op on this machine, real on machines whose fallback differs. |

## Steps

1. **Kill the vertical entrance motion** (`styles.css`). `main` fades in (opacity only, ~400ms). Drop
   `translateY(10px)` and `transform: none` from `@keyframes settle`. The sheen keeps the motion.
2. **Stop scrollbar-induced shift** (`styles.css`). Add `html { scrollbar-gutter: stable; }`. Keep
   `min-height: 100vh` as the fallback line, `100svh` second (stable small viewport — `dvh` is the
   one that changes while scrolling, so not that). Keep `overflow-x: hidden` on `body` only.
3. **Make the font swap incapable of reflowing** (`index.html`, `styles.css`).
   - `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/geist-mono/GeistMono[wght].woff2" crossorigin>`
   - `font-display: block` on both faces (short invisible window instead of a visible swap).
   - A `'Geist Mono Fallback'` face built from the local monospace with `size-adjust`,
     `ascent-override`, `descent-override`, `line-gap-override` set to Geist's metrics, placed before
     the generic in the stack. Belt and braces: if the woff2 is missing, the layout does not move.
4. **Variables** (`styles.css`). One `:root` raw-palette block, tesseract-shaped:
   `--prism-green: #64fa53`, `--prism-canvas: #0f0f0f`, `--prism-ink: #ffffff`,
   `--prism-grey: #c6c6c6`, `--prism-grain-size: 200px`, plus the type scale and the glow/shadow
   alphas. Components consume `var(--…)` only. No semantic light/dark layer — one theme.
5. **Verify** (see below), then log it in `.dev/WORKLOG.md` and delete the stray
   `.openchamber/screenshots/` folder from this session.

## Validation

- Reload 10× at 1440×900, 1280×720 and 390×844, screenshot each, and diff the block's `top` value.
- Throttle the font: DevTools → Network → throttle to Slow 3G with "Disable cache", reload — text
  must appear in place, not slide into place.
- In the user's own Chrome, paste this once before reloading; it names what shifted and by how much:

  ```js
  new PerformanceObserver(l => console.table(l.getEntries().map(e => ({
    value: e.value.toFixed(3), sources: (e.sources || []).map(s => s.node && s.node.className).join(',')
  })))).observe({ type: 'layout-shift', buffered: true });
  ```

  A non-empty table after reload confirms the cause; an empty table means the motion was purely the
  opacity fade's predecessor (the transform) or the viewport itself, and step 1 already covers it.
- Not checkable here: the user's Chrome/zoom/font stack, Safari/Firefox.

## Rollback

Three files, one commit, no build step: `git revert` the commit, or `git checkout -- index.html
styles.css`. Nothing else in the repo depends on them.

— Model: DeepSeek V4.1 Flash Free (opencode, provider: opencode)
