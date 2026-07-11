# Cambridge Marketing (CAMBM) — site guide

Static, dependency-free marketing site. No build step, no framework. Plain HTML + CSS + vanilla JS, served by a tiny Node static server. Read this before editing; it captures the things that aren't obvious from a single file.

## Pages
- `welcome.html` — the landing page (hero, brands marquee, Systems `#ai`, differentiator `#why-us`, comparison `#why-CAMBM`, pricing, CTA). Large: hero uses infinite-loop sliders + bento client gallery.
- `about.html` — the About page. Shares the same header/footer/popups/scripts as welcome. Content is organised as numbered chapters shown via `.about-chapter-num` (01–07):
  - 01 Our Story / 02 Built From Technology — zig-zag `.about-story-row` split.
  - **03 `#about-systems`** — "the connected system": a 4-stage `.about-flow` (Attract → Convert → Operate → Retain). Deliberately does NOT re-list the 6 services (those live in welcome.html `#ai`); keep it conceptual to avoid duplication.
  - **04 `#about-why`** — table-style rows (reason | description), `.about-why-item` grid.
  - **05 `#about-process`** — numbered steps (`.diff-item`).
  - **06 `#about-values`** — table-style rows (`.about-value`).
  - 07 `#about-global` — horizontal `.about-timeline`.

## Assets & versioning
- `css/main.css` (single big stylesheet, ~2500 lines) + `css/animations.css`.
- `js/i18n.js` then `js/main.js`, loaded at end of `<body>`.
- CSS/JS are linked with a `?v=1.0.x` cache-buster. **Bump that query string in BOTH html files when you change css/js**, or the static server's `no-cache, must-revalidate` still lets some proxies serve stale files.

## i18n (js/i18n.js)
- `TRANSLATIONS = { en, es, ar, si, ta }` — 5 languages, each a flat map of dot-keys (e.g. `about.systems.step1Label`). Text in the DOM is marked with `data-i18n="key"` (or `data-i18n-attr="attr:key"`).
- **Every user-visible string must exist in all 5 language blocks.** When you add/rename/remove a key, update all 5 (en, es, ar, si, ta). `ar` is RTL. Countries → languages map is at the top (`COUNTRIES`).
- `HTML_KEYS` lists keys whose value contains markup (rendered as innerHTML instead of textContent).

## JS conventions (js/main.js)
- Runs top-to-bottom (no modules/bundler). Touch vs. non-touch gated by `isTouchDevice` (`pointer: coarse`) — custom cursor, tilt, magnetic buttons, glow are desktop-only.
- **Scrolling honors reduce-motion by driving animation ourselves.** Native `scroll-behavior: smooth` / `scrollIntoView({behavior:'smooth'})` get silently downgraded to an instant jump when the OS has "reduce motion" on — which is why nav clicks animated on phones but jumped on desktops. Use `smoothScrollTo(targetY)` (rAF eased) for any programmatic scroll; nav anchors subtract `HEADER_OFFSET` (80 = `--header-height` 64 + 16, matches `section[id]{scroll-margin-top}`).
- `makeLoopSlider()` powers the hero columns and brand marquee (clone-and-recenter infinite loop, delta-timed auto-scroll, per-video IntersectionObserver play/pause). It's heavily commented — read the comments before touching it; most of the logic exists to fix specific mobile glitches.
- Bento videos are injected from `window.BENTO_VIDEOS` (base64), not HTML `src`, to avoid duplicating megabytes into every clone.

## Server / run
- `node server.js` (or `start-server.bat`) → http://localhost:8080/ (root → welcome.html). MIME map + cache headers only; no routing.
- `.claude/launch.json` defines a `site` preview config on port 8080.

## Gotchas
- Header is fixed; sections use `scroll-margin-top` so anchors aren't hidden under it.
- Reduced-motion users: still animate explicit navigation, but respect `prefers-reduced-motion` for ambient/scroll-reveal effects.
- Layout uses CSS logical properties (`inset-inline-*`, `padding-inline-*`) so RTL (`dir="rtl"` for Arabic) mirrors automatically — keep using them.
- Don't touch `CAMBM-UNEE.zip` (a large local backup, untracked, git-ignored intent).
