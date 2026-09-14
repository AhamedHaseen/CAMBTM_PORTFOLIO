# 06 · Motion and accessibility

## Motion, everything that moves

| Where | What | Trigger | Duration and easing | Engine |
| --- | --- | --- | --- | --- |
| Index hero wall | Tiles rise 14px toward the viewer and settle, offset per tile | Always, while on screen and the tab is visible | 9s loop, `ease-glide` | CSS keyframes; an IntersectionObserver sets `--wall-drift` |
| Index hero wall | Hovered or focused tile lifts to 26px, lights, and its mark pulses | Hover / keyboard focus | `motion-base`, `ease-emphasized` | CSS |
| Product marks | A colour wave walks the drawing, tile by tile, 90ms apart | Parent hovered or focused (sets `--mark-pulse: 1.8s`) | 1.8s loop | CSS keyframes |
| Adaptation diptych | Field rows rise in one by one, then the tally | Scrolled into view | Scroll-linked | CSS `animation-timeline: view()` |
| Fitted field | 54 lines rotate to point at the cursor | Pointer move, scroll, resize | `motion-shift`, `ease-glide` | One coalesced `requestAnimationFrame` writing `--angle` |
| Index cards | Border lights, card rises 2px, plate tints, mark pulses, soft spotlight follows the pointer, a sheen crosses once on entry | Hover / focus within | `motion-tint`, `motion-shift` | CSS + `SpotlightSurface` (CSS variables) |
| Index cards | Stagger in after a filter change | Filter click | 55ms apart, capped at 420ms | `RevealList` (IntersectionObserver) |
| Section heads, bodies, CTA | Rise in, section-head rule draws | Scrolled into view | Scroll-linked | CSS `animation-timeline: view()` under `@supports` |
| CTA band | Faint strands drift slowly | Always | Long loop | CSS |
| Screen plates | Tint lifts off the screenshot | Hover | `motion-tint` | CSS |

**Rules the implementation keeps, and the new one should too:**

- Nothing on a timer changes the content. The hero never advances on its own.
- No React state is updated per frame or per pointer move; values go to CSS custom properties.
- No layout is read inside a pointer or scroll handler.
- No scroll hijacking and no smooth-scroll dependency for this section.
- Scroll reveals animate transform only; content opacity stays 1, so a failed or unsupported
  animation still leaves everything readable.
- Continuous motion stops off screen and on hidden tabs.

## Reduced motion

Under `prefers-reduced-motion: reduce` every page is its finished, still composition:

- the wall does not drift or lift; its nine links all work;
- marks never pulse (the parent only sets `--mark-pulse` under a no-preference guard);
- the fitted field attaches no listener and rests with every line horizontal;
- scroll reveals, spotlight, sheen and tilt are off;
- duration tokens collapse to 1ms, and transitions that would carry a hover are removed.

All the full-page screenshots in this package were captured in this mode, so they show exactly the
reduced-motion result.

## Accessibility

- **Landmarks and headings.** One `h1` per page, an `h2` per section, `h3` per item. Breadcrumb is a
  `nav` labelled "Breadcrumb" with the current page marked `aria-current="page"`.
- **Hero wall.** A `ul` labelled "Systems" of nine real links. Each tile shows a short label and is
  announced by the full product name (the label is always a substring of it). Hover and focus
  produce the same visual state, plus a 2px focus outline.
- **Marks and the fitted field** are `aria-hidden`: the name beside each mark already says what it
  is.
- **Filter.** Buttons with `aria-pressed` in a labelled `role="group"`; the result count is
  `aria-live="polite"`.
- **Cards.** One real link per card (the name). A `::after` overlay makes the whole card clickable
  without adding a second announced link.
- **Screens.** Alt text is "`<product name>: <caption>`"; captions are visible too. The CAMBCARD
  gallery is a focusable, labelled region, so it can be scrolled from the keyboard.
- **Targets.** Tiles, chips, buttons and breadcrumb links are at least 44px tall.
- **Colour.** The cambt.com palette was designed to WCAG 2.1 AA contrast in both themes. Re-check it after
  re-theming, particularly the mono labels in `brand-electric` and the verdict tags in `danger` and
  `success`.
- **No JavaScript.** Everything except the filter, the wall's idle drift and the fitted field works
  without JavaScript; all content and links are server-rendered HTML.
