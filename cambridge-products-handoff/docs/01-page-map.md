# 01 · Page map

Two page types. Every section below is listed top to bottom, with the component that draws it, the
content it reads, and the band colour behind it. Band colours are tokens (see `03-design-tokens.md`):

| Band | Class in `editorial.module.css` | Token | Dark | Light |
| --- | --- | --- | --- | --- |
| Hero | `.hero` | `--cambt-color-bg-tint` | `#16344b` | `#eef5ff` |
| Default | `.section` | page canvas `--cambt-color-bg-canvas` | `#102a40` | `#edf1f4` |
| White | `.sectionWhite` | `--cambt-color-bg-surface` | `#1b3b53` | `#f6f8fa` |
| Pale | `.sectionPale` | `--cambt-color-bg-tint-soft` | `#1b3b53` | `#f7faff` |
| Muted | `.sectionMuted` | `--cambt-color-bg-muted` | `#16344b` | `#eaf0f6` |
| Closing CTA | `.cta` | `--cambt-color-brand-blue` | `#1268c4` | `#1268c4` |

Layout constants: content max width `--cambt-width-wide`, side padding `--cambt-gutter`
(`clamp(1.25rem, 4vw, 4rem)`), section padding `clamp(4.5rem, 8vw, 7.5rem)` top and bottom. The hero
splits into two columns (`1.1fr / 0.9fr`) at 64rem (1024px) and stacks below that.

Every section heading (`.sectionHead`) is a mono uppercase label in electric blue, then an `h2`
(max 17 characters wide) with a 3.5rem × 2px brand-blue rule drawn beneath it, then an optional lead
paragraph.

---

## A. Products index: `/products`

Screenshots: `screenshots/00-products-index--desktop-dark.jpg`, `--desktop-light.jpg`,
`--mobile-dark.jpg`, plus `interaction-01` to `interaction-04`.

| # | Section | Band | Component | Content (`products-page-content.ts`) |
| --- | --- | --- | --- | --- |
| A1 | **Hero.** Breadcrumb (Home / Products); mono label "Our systems"; `h1` "Systems that *fit* the business" with "fit" in the serif-italic accent; lead; two actions: primary "Request a Demo", secondary "Implementation services". Right column: the **system wall**, a drawn monitor on a desk with the nine product marks racked on its screen, each tile a link to its product page. | Hero | `EmphasizedText`, `SystemWall` + `SystemMark` | `hero`, product `slug` / `name` / `shortName` |
| A2 | **How we are different.** Label, `MarkedHeading` "We fit the **system to the business**, not the ~~business to the system~~" (accent tone, then a struck-through counter tone), body. Below: a two-panel **diptych**. Left, "A system built for someone else": six fields a restaurant till forces on a grocery shop, each tagged UNUSED / FORCED / KEPT, with a big red count of unused fields. Right, "A system built for you": six fields all KEPT, count 0 in green. The counter half of the heading is grey with a 2px red strike-through. | White | `AdaptationArgument`, `MarkedHeading` | `adaptation` |
| A3 | **How they are delivered.** Label, `MarkedHeading` "Every one of these is **fitted** before it is handed over", body, four bullet points with a short rule as the bullet. Right column: the **fitted field**, a 9 × 6 grid of short lines that all rotate to point at the cursor (the middle three columns are brand blue). | Default | `MarkedHeading`, `FittedField` | `customisation` |
| A4 | **The systems: "What we can deploy".** Industry filter chips (All + each industry that has a product, alphabetical), a live count ("9 systems", "2 systems in Education"), then a card grid: 1 column, 2 from 44rem, 3 from 68rem. Each card: the product mark on a ruled grid plate (16:10), then a meta line (category · "N screens"), the product name as the card's link, and the one-line positioning. | White | `SystemIndex`, `SystemMark`, `SpotlightSurface`, `RevealList` | `index`, product `slug` / `name` / `category` / `industries` / `positioning`, screen count |
| A5 | **Closing CTA.** "See it against your own operation.", body, white "Request a Demo" action, on the brand-blue band with a large faint concentric-circle motif at the right. | CTA | page shell | `contact` |

---

## B. Product detail: `/products/<slug>`

One template renders all nine. Sections appear only when the product has content for them.
**Template depth** matters: products marked `depth: "full"` get the complete sales page; `"lean"`
products (fewer than six screens) skip the four sections marked *full only*. Which product gets which
section is tabulated in `04-content-model.md`.

| # | Section | Shown when | Band | Content |
| --- | --- | --- | --- | --- |
| B1 | **Hero.** Breadcrumb (Home / Products / name); mono label = product category; `h1` = product name. Right column: the lead paragraph (falls back to the positioning line), then the actions: "View demo" if a demo URL exists, else "Request a Demo" to `/contact`; plus "Documentation" if a docs URL exists. (No product currently has either URL, so every page shows "Request a Demo" alone.) | always | Hero | `detail.*Label`, product `category` / `name` / `lead` |
| B2 | **Interface: "The system in use".** Note: "Screens are captures of the working system." Then the **screen stack**: every screen full width in order, each in a bordered plate with a numbered caption ("01 Add a room"). CAMBCARD instead reads "Themes / What your contact opens" and shows its seven phone screens in a horizontal snap gallery. | product has screens (all nine do) | White | `detail.sections.interface`, `product-screens.ts` |
| B3 | **What it solves: "The operational problem".** Numbered list (three items), each an `h3` and a paragraph. | full only | Default | product `solves` |
| B4 | **Modules and features: "What it handles".** Two-column list (from 54rem) of module names, each with a one-line description where one exists (a module with no verified description shows its name alone). | has modules | White | product `modules` |
| B5 | **What it replaces: "What this takes off the desk".** Two-column list (from 54rem), ruled rows, each led by a short red dash (what goes away). | full only | Default | product `replaces` |
| B6 | **Where we fit it: "What gets changed for you".** Body, then the same ruled two-column list, each row led by a short brand-blue dash (what gets fitted). | full only | Muted | product `adapts` |
| B7 | **Context.** Up to three columns: "Who it suits" (a sentence), "Industries supported" (chips), "Integrations" (chips; currently empty for every product, so hidden). | any of the three exists | Pale | product `suits` / `industries` / `integrations` |
| B8 | **Implementation and support: "How this system is delivered".** A list of related services, each a linked `h3` plus the reason it relates. **These link to Cambridge Technology service pages; re-point or remove for Cambridge Marketing.** | always | White | product `relatedServices` |
| B9 | **Closing CTA.** "See it against your own numbers.", body, "Request a Demo". | always | CTA | `detail.contact` |

### Screen formats (B2)

The screenshots are three genuinely different shapes, and the layout treats each differently. The
format is set per screen in `product-screens.ts`:

| Format | What it is | How it is shown | Products |
| --- | --- | --- | --- |
| `wide` | Full-window admin capture, 1440px wide | Stacked at the column's full width | Hostel, Property, Gym, Parking, Travel |
| `panel` | Smaller composite, 800–1440px | Stacked, centred, **never wider than its own pixels** (`--native` cap), so it is never upscaled | School, Client/CRM, Learning |
| `portrait` | Phone screen, 576px wide | Horizontal scroll-snap gallery of cards, keyboard focusable | CAMBCARD |

---

## C. SEO and structure (both page types)

- `<title>` and meta description per page; the index uses the page document's SEO fields, each
  product uses its own (falling back to its name and lead). See `source/app/_lib/seo.tsx`.
- Breadcrumb JSON-LD on every page (`breadcrumbSchema`).
- Heading order: one `h1` per page, `h2` per section, `h3` per item.
- Product routes are generated from the published records; any other slug returns 404.
