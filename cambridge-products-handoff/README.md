# Products section: handoff package

This package is everything needed to rebuild the **Products** section of the Cambridge Technology
website (cambt.com) on the **Cambridge Marketing** site, in Cambridge Marketing's own theme:

- the Products index page (`/products`);
- the nine product detail pages (`/products/<slug>`);
- all the assets they use: 52 interface screenshots, 9 drawn product marks (SVG), fonts;
- the working source code, copied from the production site;
- full-page screenshots of every page, in the order the site shows them.

Exported 14 September 2026 from the Cambridge Technology repository (`apps/web`, Next.js 16 /
React 19). Nothing in that repository was changed to produce it.

## Start here

1. Look through `screenshots/` in number order. That is the whole section: `00` is the index,
   `01`–`09` are the product pages in the order the index lists them. Each page has a desktop dark,
   a desktop light and a mobile capture. The `interaction-*.png` files show the four hover and filter
   states a still capture cannot.
2. Read `docs/01-page-map.md`. It lists every section of every page, top to bottom, and when each
   one appears.
3. Read `docs/02-components.md` for how each piece behaves, then `docs/06-motion-and-accessibility.md`.
4. Re-theme with `docs/03-design-tokens.md`. It lists every design value this section uses, with
   the Cambridge Technology value, so each one can be swapped for a Cambridge Marketing value.
5. Build against `docs/07-rebuild-checklist.md`.

## What is in the package

```
README.md                     this file
LICENSES-AND-CREDITS.md       what may be reused, and the credits that must travel with it
docs/
  01-page-map.md              every section of every page, in order, with its rendering rules
  02-components.md            each component: job, inputs, behaviour, CSS notes
  03-design-tokens.md         every token used, dark and light values, and how to re-theme
  04-content-model.md         the Product record, every field, and which products fill which sections
  05-assets.md                inventory of every screenshot, mark and font, with sizes
  06-motion-and-accessibility.md   motion rules, reduced motion, keyboard and screen reader behaviour
  07-rebuild-checklist.md     the order to build it in, and how to check it is right
screenshots/                  00-products-index … 09-learning-management, 3 captures each, + 4 interaction states
assets/
  catalogue/<slug>/NN.webp    the 52 product screens, final and ready to serve (manifest.json lists them)
  marks/<slug>.svg            the 9 drawn product marks as standalone vectors
source/                       the production source, folder layout kept exactly as on cambt.com
  app/(public)/products/…     index page, detail page ([slug]/) and every component they use
  app/(public)/_content/…     product records, screen list, all page copy, services stub
  app/(public)/_styles/editorial.module.css   the page shell shared by both page types
  app/_components/…           the small shared helpers the section imports
  app/_lib/…                  SEO helpers and a static content loader
  design-system/              tokens.css, styles.css, the Breadcrumb component (stands in for @cambt/ui)
```

`(public)` is a Next.js route group: it groups files without adding to the URL, so
`app/(public)/products/page.tsx` serves `/products`.

## How the source is organised

The code is **Next.js App Router with React Server Components and CSS Modules**. If the Cambridge
Marketing site is also Next.js, most files can be dropped in and re-themed. If it is not, treat the
source as an exact specification: the docs describe each component in framework-neutral terms.

| Concern | Where it lives |
| --- | --- |
| Index page | `source/app/(public)/products/page.tsx` |
| Detail page (all nine share one template) | `source/app/(public)/products/[slug]/page.tsx` |
| Product facts, modules, industries, etc. | `source/app/(public)/_content/products.ts` |
| Screens per product, in order | `source/app/(public)/_content/product-screens.ts` |
| All page copy (headings, labels, CTAs) | `source/app/(public)/_content/products-page-content.ts` |
| Page shell: hero, section bands, CTA band | `source/app/(public)/_styles/editorial.module.css` |
| Design tokens | `source/design-system/tokens.css` |

### What differs from the cambt.com files

Everything is copied as it is on the live site, except these, which were changed so the package
stands on its own. The whole `source/` folder type-checks in isolation (TypeScript strict mode,
React 19 and Next.js 16 types) with nothing else from cambt.com:

| File | Change |
| --- | --- |
| `_content/products-page-content.ts` | New: the page copy, extracted verbatim from cambt.com's larger `site-documents.ts`. Both pages import it instead. |
| `_content/products.ts` | The four unpublished product records removed (see below). The nine published ones are untouched. |
| `_content/services.ts` | New stub. On cambt.com this is Cambridge Technology's service list. Replace it, or drop section B8. |
| `_lib/site-content.ts` | Static drop-in with the same signatures. It returns the committed content instead of reading cambt.com's database. The original is kept as `site-content.cambt-reference.ts`. |
| `_components/motion/index.ts` | Trimmed to the two helpers this section uses. |
| `design-system/index.ts`, `lib/cn.ts` | Stand in for the `@cambt/ui` package. Alias `@cambt/ui` to `design-system/index.ts` in `tsconfig` paths, or edit the two Breadcrumb imports. |

`_lib/seo.tsx` still says `siteUrl = "https://cambt.com"` and names Cambridge Technology in the
structured data; change both.

Requirements if dropping the files into Next.js: Next 16, React 19, CSS Modules (built in), and
a `*.module.css` type declaration (Next provides one). `design-system/styles.css` is Tailwind 4 based
on cambt.com; take from it only the `cambt-action` button class and the `[data-heading-accent]` rule
(both noted in `docs/02-components.md`), not the whole file.

Only three components ship JavaScript to the browser: the hero wall (`system-wall.tsx`), the
filterable index (`system-index.tsx`) and the pointer field (`fitted-field.tsx`). Everything else
renders on the server and works with JavaScript turned off.

## Things to change for Cambridge Marketing

These are Cambridge Technology specifics. Decide each one before building:

- **Company name in copy.** The index hero lead says "Working systems Cambridge Technology builds…".
  All copy is in `products-page-content.ts`; nothing is hard-coded in components.
- **Links.** "Request a Demo" goes to `/contact`; "Implementation services" goes to `/services`.
  Each detail page ends with "How this system is delivered", linking to Cambridge Technology
  service pages (`relatedServices` in `products.ts`). Point these at the Cambridge Marketing
  equivalents, or remove that section.
- **Colour.** The marks' "filled" colour, the accent heading tone and the buttons all come from
  `--cambt-color-brand-blue` and friends. `docs/03-design-tokens.md` maps each one.
- **Content system.** On cambt.com the copy and product records can be overridden from a CMS,
  with the files in `_content/` as the fallback. The packaged `_lib/site-content.ts` just returns
  those files; point its two functions at Cambridge Marketing's CMS if it has one.

## Rules that come with the content

These are owner decisions on the Cambridge Technology site. Keep them unless the owner says
otherwise:

- **No third-party product names anywhere.** The systems are described, not named ("Hostel and room
  management system"), and the screenshots have had the original vendors' marks covered. Never add
  a vendor name to copy, captions, file names or alt text. CAMBCARD is the one exception: it is
  Cambridge's own brand.
- **No invented content.** Nothing on these pages is a mock-up. Every screen is a capture of the
  running system; every module is real. If a field is empty, its section is left out rather than
  filled with placeholder text.
- **Screens before words.** On each detail page the screenshots come first, then the claims.
- Four further product records exist on cambt.com but are unpublished at the owner's instruction.
  They are **not** in this package.
