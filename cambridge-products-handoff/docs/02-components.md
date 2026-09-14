# 02 · Components

Every component used by the section, in the order a reader meets it. "Server" means it renders to
HTML with no browser JavaScript; "client" means it hydrates. Each source file carries a detailed
comment explaining its decisions; read it alongside this summary.

---

## SystemWall (client)

`source/app/(public)/products/system-wall.tsx` · `system-wall.module.css` · seen in `interaction-01-hero-wall-hover.png`

**Job.** The index hero figure: a monitor drawn in hairlines, standing on a neck and foot, with the
nine products racked 3 × 3 on its screen. Every tile is a real link to its product page.

**Inputs.** `systems: { slug, name, label }[]`. `label` is the short tile text (for example
"HOSTEL"); `name` is the full name, used as the link's accessible name. The label must be a substring
of the name (WCAG 2.5.3, label in name).

**Behaviour.**
- CSS 3D only (`perspective` on the desk, `translateZ` on tiles). No WebGL, no canvas, no library.
- **Idle drift.** Each tile rises 14px toward the viewer and settles, on a 9s loop, offset by its
  position (`--cell-index` = column + row) so the wall never moves in unison. Nothing moves sideways,
  so a tile never slides out from under its own link.
- The drift runs only while the wall is on screen and the tab is visible: an IntersectionObserver
  writes `--wall-drift: 9s`, or `0s` to stop it. There is no timer and no React state.
- **Hover or keyboard focus** on a tile lifts it to `translateZ(26px)`, lights its border and
  background, and starts the mark's colour pulse (see SystemMark). Hover and focus look identical on
  purpose; focus also gets a 2px electric-blue outline.
- The frame itself never moves (an earlier version leaned toward the pointer; the owner asked for it
  fixed).
- Under 30rem the perspective is dropped; the wall stays 3 across.
- Reduced motion: no drift, no lift, no transitions. The wall is a still, complete figure.

---

## SystemMark (server)

`source/app/(public)/products/system-mark.tsx` · `system-mark.module.css` · vectors in `assets/marks/*.svg`

**Job.** One drawn schematic per product, recognisable by shape before the name is read:

| Product | Mark | What it draws |
| --- | --- | --- |
| Hostel | Rooms | Two runs of six rooms either side of a corridor; let rooms filled |
| School | Timetable | A week grid with taught periods placed |
| CAMBCARD | Card | A portrait card with header, avatar, text lines and a QR finder pattern |
| Property | Portfolio | Four buildings of different heights, let units filled |
| Gym | Weights | A loaded barbell; filled plates are capacity in use |
| Parking | Bays | Twelve bays either side of a dashed aisle; taken bays filled |
| Travel | Route | A curved journey through three stops, over a date scale |
| Learning | Modules | Five stacked module bars, three complete, with a progress spine |
| Client/CRM | Pipeline | A funnel of four stages narrowing to the sale |

**Drawing rules** (keep them if you add a mark): `viewBox="0 0 160 120"`; strokes 1.25 (3 for the
barbell bar), square caps, `vector-effect: non-scaling-stroke` so lines stay hairline at any size; all
structure in `currentColor`; exactly two fill tones, **filled** = brand blue (a slot in use) and
**empty** = `currentColor` at 14% (a slot available). No gradients, shadows or perspective.

**The pulse.** Each filled/empty tile carries `--fill-index`, its *position in the drawing*
(row-major, diagonal for the portfolio, symmetric for the barbell). A parent turns the pulse on by
setting one inherited property, `--mark-pulse: 1.8s`; each tile then brightens to electric blue and
settles, delayed by `index × 90ms`, so a wave walks across the drawing. The switch is a *duration*
rather than an animation name because CSS Modules hash keyframe names. With the property unset, the
duration is 0s and the mark rests at its normal colours.

**Standalone SVGs.** `assets/marks/<slug>.svg` are exported from the rendered page with the colours
resolved: filled = `#1268C4`, empty = `currentColor` at `fill-opacity: 0.14`, structure =
`currentColor` (the file sets `color:#5B7088`; override `color` to re-tint). Each tile keeps its
`data-fill-index` so the pulse can be rebuilt. Swap `#1268C4` for the Cambridge Marketing accent.

---

## EmphasizedText (server)

`source/app/_components/emphasized-text.tsx`

Sets one word or phrase of a page `h1` in the accent face (Instrument Serif, italic look, accent
colour). Used once per page, for the index hero's "fit". Input: `text`, `emphasis`.

---

## MarkedHeading (server)

`source/app/(public)/products/marked-heading.tsx` · `marked-heading.module.css`

A section heading passed as **parts** rather than a string, so phrases that repeat inside one
sentence can be marked exactly. Three tones only: `plain`; `accent` (heading accent colour, the idea
argued for); `counter` (secondary grey with a 2px red strike-through, the idea argued against).
Input: `parts: { text, tone? }[]`, optional `as` (`h2` or `h3`).

---

## AdaptationArgument (server)

`source/app/(public)/products/adaptation-argument.tsx` · `adaptation-argument.module.css`

**Job.** The page's central argument as a labelled comparison, not a mock interface: the same field
list twice. Left panel, "A system built for someone else" (a restaurant till in a grocery shop); right
panel, "A system built for you".

**Data.** Each row is `{ field, verdict }` with verdict `unused`, `forced` or `kept`. The verdict
drives the styling: unused fields are struck through with a red tag, forced fields are greyed, kept
fields get a green tag. The big figure under the left panel is **counted from the rows**
(`unused` only), so it cannot drift from the list; the right panel always shows 0 in green.

**Layout.** Two columns from 54rem, stacked below. Rows rise in one by one on a CSS scroll
timeline (`--row` index for the stagger); the tally arrives last. No JavaScript.

---

## FittedField (client)

`source/app/(public)/products/fitted-field.tsx` · `fitted-field.module.css` · seen in `interaction-04-fitted-field-pointer.png`

**Job.** The "every one is fitted" figure: a 9 × 6 grid of short lines that all rotate to face the
cursor. The middle three columns are brand blue, the rest secondary grey at 60%. `aria-hidden`.

**Behaviour and performance** (the reason this component exists as written):
- Angles are written to a CSS variable (`--angle`) on each line, never React state.
- No layout is read per line: each line's centre is derived from its grid position, so each frame
  reads one rectangle, not 54.
- Pointer, scroll and resize events are coalesced into one `requestAnimationFrame`.
- Scrolling re-aims the lines (the field moves under a still cursor), but only after the first real
  pointer move.
- Only on fine pointers with hover, and not under reduced motion. Otherwise no listener is attached
  and every line rests horizontal, which still reads as a finished figure.
- Rotation eases on `--cambt-motion-shift` / `--cambt-ease-glide` so it lags the pointer slightly.

Adapted from React Bits MagnetLines (MIT); see `LICENSES-AND-CREDITS.md`.

---

## SystemIndex (client)

`source/app/(public)/products/system-index.tsx` · `system-index.module.css` · seen in `interaction-02` and `interaction-03`

**Job.** The scannable catalogue: filter chips, a live count, and a card per product.

**Inputs.** `systems: { slug, name, positioning, category, industries[], screenCount }[]`,
`industries[]` (only those with a product, sorted), `labels` (All, filter label, singular, plural,
"in", "screens").

**Behaviour.**
- The filter is the only stateful control on the page. Chips are `<button aria-pressed>` in a
  `role="group"`; the chips are not rendered at all if there is only one industry.
- The count line is `aria-live="polite"`: "9 systems", "2 systems in Education".
- Cards: a 16:10 plate on a 16px ruled grid (`--cambt-line-grid`) holding the mark, then category
  and "N screens" in mono, the name as the only link, and the positioning line. The link's `::after`
  stretches over the whole card, so the card is one click target and one announced link.
- Hover: border lights, card rises 2px, plate tints, and the mark's pulse starts
  (`--mark-pulse: 1.8s`, set only under no-preference motion). Keyboard focus inside the card does
  the same.
- Card entrance after a filter change uses `RevealList`; the hover spotlight uses `SpotlightSurface`
  with `glare`.

---

## SpotlightSurface and RevealList (client helpers)

`source/app/_components/motion/spotlight-surface.*`, `reveal-list.*`

- **SpotlightSurface** writes the pointer position to CSS variables on the card (never React state)
  to draw a soft brand-blue spotlight, and with `glare` a diagonal sheen that crosses the card once on
  entry (tokens `--cambt-sheen-core`, `--cambt-sheen-edge`). Optional tilt, capped at 4°, is off
  here. No listener on coarse pointers or reduced motion.
- **RevealList** staggers items in as they arrive (55ms apart, capped at 420ms) using an
  IntersectionObserver, for lists that change on the client. Items are visible by default; the
  observer only ever adds the animation, so a failure leaves a complete list.

---

## ScreenStack (server)

`source/app/(public)/products/[slug]/screen-stack.tsx` · `screen-stack.module.css`

**Job.** A product's screens, first thing after the hero, in the order given by `product-screens.ts`.

- `wide` and `panel` screens stack vertically as `<figure>`s: a bordered plate (with a faint tint
  that lifts on hover) and a caption with a two-digit mono index ("01 Add a room").
- Each frame is capped at its own pixel width (`--native: <width>px`), so nothing is ever upscaled.
- The images are served exactly as delivered (`unoptimized` in Next.js). They are already WebP at
  quality 92; letting a framework re-encode and upscale them is what made earlier versions soft.
  **Do the same on the new site: serve the files as they are.**
- Only the first screen loads eagerly; the rest are lazy.
- Alt text is `"<product name>: <caption>"`.
- `portrait` screens (CAMBCARD) go into a horizontal scroll-snap gallery: a focusable
  `role="group"` region (`tabIndex=0`, labelled "<name>: themes") of phone cards with captions.
  `data-lenis-prevent` exists only because cambt.com uses a smooth-scroll library; drop it if yours
  does not.

---

## Breadcrumb (server)

`source/design-system/components/breadcrumb.tsx`

`<nav aria-label="Breadcrumb">` with an ordered list; separators are `aria-hidden`; the current page is
plain text with `aria-current="page"`; links have a 44px minimum height. It uses Tailwind utility
classes; restyle freely.

---

## Page shell (`editorial.module.css`)

Shared by both page types: `.hero` (tinted band with a lit bottom rule), `.heroGrid` (two columns
from 64rem), `.label` (mono uppercase electric-blue kicker), `.section` + band variants,
`.sectionHead` (h2 with drawn rule), `.primaryAction` / `.secondaryAction` / `.ctaAction` (buttons
that also compose the global `cambt-action` class from `design-system/styles.css`), and `.cta` (the
blue closing band with its concentric-circle motif and slow drifting strands). Section heads and
bodies rise in on a CSS scroll timeline (`animation-timeline: view()`) guarded by `@supports` and
reduced motion; content opacity stays 1 throughout, so nothing can be left invisible.
