# 07 · Rebuild checklist

A suggested order. Each step can be checked against the screenshots before moving on.

## 1. Decide the Cambridge Marketing specifics

- [ ] Copy that names Cambridge Technology (the index hero lead) reworded for Cambridge Marketing.
- [ ] Where "Request a Demo" and "Implementation services" point.
- [ ] What replaces "How this system is delivered" (B8), which links to Cambridge Technology service
      pages. Re-point `relatedServices`, or drop the section.
- [ ] Brand accent, surfaces and fonts mapped onto the tokens (`03-design-tokens.md`).
- [ ] Dark and light themes both, or one only. The components support both from the same tokens.

## 2. Foundations

- [ ] Define the token set (the tables in `03-design-tokens.md`), mapped to Cambridge Marketing values.
- [ ] Load the fonts, or map `--cambt-font-sans` / `--cambt-font-accent` to the site's own.
- [ ] Copy `assets/catalogue/` to `/catalogue/` on the site and serve it **without** re-encoding or
      resizing (in Next.js, `<Image unoptimized>`).
- [ ] Bring over the content files: `products.ts`, `product-screens.ts`, `products-page-content.ts`.

## 3. Page shell

- [ ] Hero band, section bands, section head with drawn rule, buttons, blue CTA band
      (`editorial.module.css`). Compare with the top and bottom of any screenshot.

## 4. Index page (`00-products-index`)

- [ ] `SystemMark`: all nine drawings, filled and empty tones, pulse on `--mark-pulse`.
- [ ] `SystemWall`: 3 × 3 tiles as links, drift only on screen, hover/focus lift. Check with
      `interaction-01`.
- [ ] `AdaptationArgument`: diptych, verdict styles, the unused count computed from the rows.
- [ ] `MarkedHeading`: plain, accent and struck counter tones.
- [ ] `FittedField`: 9 × 6 lines following the pointer, resting flat without one. Check with
      `interaction-04`.
- [ ] `SystemIndex`: chips, live count, card grid 1 / 2 / 3 columns at 44rem / 68rem, hover state.
      Check with `interaction-02` and `interaction-03`.

## 5. Detail page (`01`–`09`)

- [ ] One template driven by the record; sections omitted when empty; `lean` products skip Solves,
      Replaces and Adapts (see the matrix in `04-content-model.md`).
- [ ] `ScreenStack`: wide full width, panels at native width (never upscaled), CAMBCARD as a portrait
      gallery; numbered captions; alt text; first image eager, the rest lazy.
- [ ] Only published slugs resolve; anything else returns 404.
- [ ] Per-page title and description, and breadcrumb structured data.

## 6. Verify

- [ ] Side by side with each screenshot at 1440px (dark and light) and 390px.
- [ ] Also check 1024px and 768px: hero stacks below 1024px, diptych below 54rem, grid steps.
- [ ] No horizontal scroll at any width.
- [ ] Keyboard only: tab through the wall, filter chips, cards, CAMBCARD gallery; focus always
      visible.
- [ ] Reduced motion on: every page complete and still (it should match the screenshots exactly).
- [ ] Screen reader: one link per card, wall tiles announced by full name, filter count announced.
- [ ] No third-party product names anywhere, including alt text and file names.
- [ ] Contrast re-checked on the new palette, in both themes.
