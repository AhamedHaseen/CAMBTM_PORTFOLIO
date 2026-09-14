# 03 · Design tokens and re-theming

Every visual value in this section comes from a CSS custom property prefixed `--cambt-`. There are
**60** in use. They are defined in `source/design-system/tokens.css`: dark values on
`:root` (the site's default theme) and light values on `[data-theme="light"]`. The site follows the
visitor's system preference and offers a toggle.

## How to re-theme for Cambridge Marketing

The cleanest route is to **keep the token names and change their values**. The components never use a
literal colour for anything that should follow the brand, so defining these variables in the
Cambridge Marketing stylesheet, or aliasing them to Cambridge Marketing's own tokens, re-themes every
page at once:

```css
:root {
  --cambt-color-brand-blue: var(--cm-accent);           /* marks, buttons, rules, CTA band */
  --cambt-color-brand-blue-hover: var(--cm-accent-hover);
  --cambt-color-brand-electric: var(--cm-accent-bright); /* kicker labels, pulse peak, focus */
  --cambt-color-heading-accent: var(--cm-heading-accent);
  --cambt-color-bg-canvas: var(--cm-background);
  /* …and so on down the tables below */
}
```

A find-and-replace of `--cambt-` with Cambridge Marketing's own prefix works just as well.

### The roles that carry the look

| Role | Token(s) | Where you see it |
| --- | --- | --- |
| Brand accent | `brand-blue` | Mark fills, primary buttons, section-head rules, CTA band, fitted-field centre lines |
| Bright accent | `brand-electric` | Mono kicker labels, the pulse peak on marks, focus outlines |
| Heading accent | `heading-accent` | The serif "fit" in the hero, accent parts of marked headings |
| Negative / positive | `danger`, `success` | Struck fields, UNUSED / KEPT tags, the red and green tallies, red dashes on "What it replaces" |
| Surfaces | `bg-canvas`, `bg-surface`, `bg-tint`, `bg-tint-soft`, `bg-muted`, `bg-raised` | Section bands, card plates, wall tiles |
| Lines | `border-subtle`, `border-strong`, `border-lit`, `line-grid` | Every 1px rule, card borders, hover borders, the 16px ruled grid behind the marks |
| Type | `font-sans` (Inter), `font-accent` (Instrument Serif), `font-mono` | Body and headings; the single emphasised word; labels, indices and tags |

### Fixed values that are not tokens

A handful of literals are deliberate; check them when re-theming:

- `white` and `rgb(255 255 255 / …)` inside the blue CTA band (`.cta` in `editorial.module.css`).
- `color-mix(in srgb, currentColor 14%, transparent)` for empty mark tiles.
- The exported SVG marks hard-code `#1268C4` (filled tiles) and `#5B7088` (the structure colour, set
  as `color` on the root `<svg>`). Replace both.
- Breakpoints, all in the module CSS: 30rem, 44rem, 48rem, 54rem, 60rem, 64rem, 68rem.

## Fonts

- **Inter**: body and headings, variable weight (headings use 500–620; see the weight tokens).
- **Instrument Serif**: only the one emphasised word per page `h1`, italic, at 1.08em so it sits on
  the same optical line as Inter.
- **Mono**: a system stack (`"Cascadia Code", "SFMono-Regular", Consolas, ui-monospace, monospace`) for
  kicker labels, indices, counts and tags. No font file is needed.

Both named fonts are Google Fonts under the SIL Open Font License; cambt.com loads them with
`next/font/google`. If Cambridge Marketing has its own typefaces, map `--cambt-font-sans` and
`--cambt-font-accent` to them.

## Motion tokens

| Token | Value | Used for |
| --- | --- | --- |
| `--cambt-motion-base` | 260ms | Wall tile colour and lift |
| `--cambt-motion-tint` | 300ms | Colour changes (borders, fills, marks) |
| `--cambt-motion-shift` | 420ms | Movement (card rise, fitted-field rotation) |
| `--cambt-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Decelerating; colour |
| `--cambt-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | The wall tile lift |
| `--cambt-ease-glide` | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | Symmetric; movement and loops |

Under `prefers-reduced-motion: reduce` the duration tokens collapse to 1ms (end of `tokens.css`).

## Every token in use, with its values

### Layout, radius and actions

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--cambt-action-min-height` | `3.25rem` | same |
| `--cambt-action-padding-block` | `0.85rem` | same |
| `--cambt-action-padding-inline` | `1.4rem` | same |
| `--cambt-action-radius` | `var(--cambt-radius-md)` | same |
| `--cambt-gutter` | `clamp(1.25rem, 4vw, 4rem)` | same |
| `--cambt-radius-md` | `0.5rem` | same |
| `--cambt-radius-sm` | `0.25rem` | same |
| `--cambt-width-reading` | `44rem` | same |
| `--cambt-width-wide` | `86rem` | same |

### Colour, lines and elevation

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--cambt-color-accent-text` | `#80bcff` | `#0c5aa9` |
| `--cambt-color-bg-canvas` | `#102a40` | `#edf1f4` |
| `--cambt-color-bg-muted` | `#16344b` | `#eaf0f6` |
| `--cambt-color-bg-raised` | `#23465f` | `#f6f8fa` |
| `--cambt-color-bg-surface` | `#1b3b53` | `#f6f8fa` |
| `--cambt-color-bg-tint` | `#16344b` | `#eef5ff` |
| `--cambt-color-bg-tint-soft` | `#1b3b53` | `#f7faff` |
| `--cambt-color-border-lit` | `rgb(46 145 255 / 0.42)` | `rgb(18 104 196 / 0.45)` |
| `--cambt-color-border-strong` | `rgb(255 255 255 / 0.18)` | `#b9c6d3` |
| `--cambt-color-border-subtle` | `rgb(255 255 255 / 0.09)` | `#dce4ec` |
| `--cambt-color-brand-blue` | `#1268c4` | same |
| `--cambt-color-brand-blue-hover` | `#0c5aa9` | same |
| `--cambt-color-brand-deep-navy` | `#061a2b` | same |
| `--cambt-color-brand-electric` | `#2e91ff` | same |
| `--cambt-color-danger` | `#ff8f8f` | `#b53b3b` |
| `--cambt-color-focus` | `#2e91ff` | same |
| `--cambt-color-heading-accent` | `#80bcff` | `#1268c4` |
| `--cambt-color-success` | `#35c48c` | `#177d55` |
| `--cambt-color-text-body` | `#bed0df` | `#536679` |
| `--cambt-color-text-lead` | `#b6c7d9` | `#42566a` |
| `--cambt-color-text-primary` | `#eaf2fb` | `#101820` |
| `--cambt-color-text-secondary` | `#b1c3d3` | `#536373` |
| `--cambt-line-grid` | `rgb(120 170 230 / 0.07)` | `rgb(18 104 196 / 0.08)` |
| `--cambt-shadow-panel` | `0 20px 50px rgb(2 8 16 / 0.45)` | `0 18px 44px rgb(6 26 43 / 0.1)` |
| `--cambt-sheen-core` | `rgb(255 255 255 / 0.16)` | `rgb(18 104 196 / 0.2)` |
| `--cambt-sheen-edge` | `rgb(255 255 255 / 0.1)` | `rgb(18 104 196 / 0.11)` |

### Motion

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--cambt-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | same |
| `--cambt-ease-glide` | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | same |
| `--cambt-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | same |
| `--cambt-motion-base` | `260ms` | same |
| `--cambt-motion-shift` | `420ms` | same |
| `--cambt-motion-tint` | `300ms` | same |

### Typography

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--cambt-font-mono` | `"Cascadia Code", "SFMono-Regular", Consolas, ui-monospace, monospace` | same |
| `--cambt-font-size-lg` | `1.125rem` | same |
| `--cambt-font-size-md` | `1rem` | same |
| `--cambt-font-size-sm` | `0.875rem` | same |
| `--cambt-font-size-xl` | `1.25rem` | same |
| `--cambt-font-size-xs` | `0.75rem` | same |
| `--cambt-leading-display` | `0.98` | same |
| `--cambt-leading-section` | `1.02` | same |
| `--cambt-tracking-display` | `-0.035em` | same |
| `--cambt-tracking-heading` | `-0.028em` | same |
| `--cambt-tracking-label` | `0.14em` | same |
| `--cambt-type-display` | `clamp(3.6rem, 7.1vw, 6rem)` | same |
| `--cambt-type-h2` | `clamp(2.65rem, 5.1vw, 4.8rem)` | same |
| `--cambt-type-h3` | `clamp(1.5rem, 2.3vw, 2rem)` | same |
| `--cambt-type-lead` | `clamp(1.05rem, 1.5vw, 1.25rem)` | same |
| `--cambt-weight-action` | `600` | same |
| `--cambt-weight-display` | `500` | same |
| `--cambt-weight-heading` | `520` | same |
| `--cambt-weight-subhead` | `620` | same |
