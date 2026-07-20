# Senior Review — Findings & Fixes

## Root causes of the Android layout breakage (not just "missing responsive")

1. **`app.js` registered `DOMContentLoaded` twice** (an unconditional listener,
   plus an identical one in the "fallback" branch that always evaluated true
   at that point in the load timeline). Result: the whole init sequence ran
   **twice** — 30 candles instead of 15 (visually overlapping), 30 hidden
   stars instead of 15 (with duplicate DOM ids), the intro typed twice, the
   gift button's click handler fired its logic twice per click.
2. **`game.js` re-implemented the candle/star game** with its own click
   handlers and its own separate counters — but its `DOMContentLoaded`
   listener ran *before* `app.js` had created the candle/star elements
   (script load order), so it silently attached to nothing. 217 lines of
   fully dead code that looked like it worked.
3. **`secret.js` re-implemented the Konami-code and secret-text detector**
   that already existed in `app.js`. Both ran. Both started their own
   `setInterval` fireworks loop on trigger, and **neither ever cleared it**
   — a real, unbounded CPU/battery leak that got twice as bad by existing
   twice.
4. **`.hidden-star` (the 15-star hunt) had no base CSS** in any stylesheet
   `index.html` actually links. Its real styling only existed in
   `css/style.css` — a 24KB dead duplicate of `styles.css` that was never
   referenced by the page. So 15 unstyled `<div>`s got appended to `<body>`
   with inline `left`/`top` percentages that did nothing (no `position` was
   set) — a real layout bug, not a cosmetic miss.
5. **`css/responsive.css` targeted an older version of this page.** Rules for
   `.cake`, `.cake-layer`, `.layer-1/2/3`, `.album-grid`, `.album-item`,
   `.gift-box`/`.gift-top`/`.gift-front`/`.gift-side`, `.audio-control` — none
   of these exist in the current HTML. Most of the file did nothing on any
   device, while the actual mobile bugs above went unaddressed.
6. **`html { font-size: 13px/14px }` switched at each breakpoint**, combined
   with `rem`-based spacing — a fragile pattern that makes spacing/line
   heights jump between breakpoints instead of scaling smoothly. Replaced
   with `clamp()`-based fluid typography and spacing, so there's one curve
   from 320px up instead of three discrete steps.
7. **`AudioContext` was created on `DOMContentLoaded`, before any user
   gesture.** Chrome/Android suspends every AudioContext created outside a
   user-gesture handler, so every sound effect silently never played on a
   phone. Now resumed on first tap/click/key.
8. **The cursor-trail rebuilt up to 15 DOM nodes via `innerHTML = ''` on
   every single `mousemove`.** `mousemove` never fires on touch at all, so
   on the Android phones this site targets, that code ran for zero benefit —
   it's now skipped entirely without a fine pointer, and rebuilt with a
   reused node pool + `transform` when it does run on desktop.

## What was removed (all confirmed dead via cross-reference, not guessed)
- `css/style.css` — unused duplicate stylesheet (24KB, never linked).
- `js/game.js`, `js/secret.js` — fully duplicated/dead as explained above.
- ~80 unused `@keyframes` in `animation.css` (parallax, aurora-glow, meteor,
  shimmer, 3D flip, etc.) that no HTML/JS in the project ever triggered.
- 7 unused utility classes in the old `animation.js`
  (`RippleEffect`, `GlowAnimation`, `StaggerAnimation`, `BounceAnimation`,
  `PulseAnimation`, `ShakeAnimation`, `FlipAnimation`) — defined, never
  called. Ripple has been kept and actually wired to buttons/cards/wishes
  this time.
- The Playfair Display font import — loaded on every page view, never
  referenced by any CSS `font-family`, and it doesn't have solid Vietnamese
  diacritic coverage, so it wasn't worth wiring in either.
- `ParallaxEffect` and the app.js `ScrollTrigger` class targeted
  `.parallax-item` / `[data-animate]` — selectors matching **zero** elements
  in this HTML — while still attaching a permanent global `scroll` +
  `mousemove` listener that did nothing every frame.

## What was fixed/improved, not removed
- Galaxy background canvas: pauses its `requestAnimationFrame` loop on
  `visibilitychange` (was running forever, even with the phone locked),
  caps `devicePixelRatio` at 2, and scales star/aurora counts down on
  narrow screens and under `prefers-reduced-motion`.
- Fireworks: `shadowBlur` set once per frame instead of once per particle;
  hard particle cap so a burst of easter-egg triggers can't run away;
  `stop()`/`clear()` now actually exist and are used by cosmic mode.
- Cosmic mode / secret mode: single implementation, capped duration (10s),
  interval IDs stored and cleared — was an unbounded leak, twice.
- A small CSS-only cake plate now sits under the candles (the old CSS had
  orphaned `.cake`/`.layer-*` rules suggesting a cake graphic was originally
  intended but got lost — restored it without adding markup or images).
- Every touch target (candles, wishes, hidden stars, buttons) uses
  `touch-action: manipulation` and a real tap state; hover-only effects are
  now gated behind `@media (hover: hover) and (pointer: fine)` so nothing
  gets visually "stuck" from a touch on Android.
- `env(safe-area-inset-*)` support for notched phones; `100svh`/`100dvh`
  paired so the layout doesn't jump when the Android URL bar collapses.

Nothing about the birthday content, the galaxy/fireworks/confetti concept,
the candle game, the star hunt, the secret codes, or the timeline was
removed — only the duplicate/dead code fighting against them.
