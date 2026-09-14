# 05 · Assets

Everything a page loads, apart from fonts, is in `assets/`. Nothing is hot-linked.

## Product screens: `assets/catalogue/<slug>/NN.webp`

**52 files, 3.2 MB in total.** WebP at quality 92, at most 1440px wide. These are the final,
published files: the original vendors' marks have already been covered, and they should be served
**as they are**, with no resizing or re-encoding by the new site's image pipeline (see ScreenStack in
`02-components.md`). `assets/catalogue/manifest.json` lists the same data in machine-readable form, and
`source/app/(public)/_content/product-screens.ts` is the same list as the pages consume it.

Put them at `/catalogue/<slug>/NN.webp` on the new site and `product-screens.ts` works unchanged.

| Product | File | Caption | Format | Size (px) | Bytes |
| --- | --- | --- | --- | --- | --- |
| `hostel-management` | `assets/catalogue/hostel-management/01.webp` | Add a room | wide | 1440×960 | 29,894 |
| `hostel-management` | `assets/catalogue/hostel-management/02.webp` | Add a tenant | wide | 1440×1260 | 64,702 |
| `hostel-management` | `assets/catalogue/hostel-management/03.webp` | All invoices | wide | 1440×960 | 59,762 |
| `hostel-management` | `assets/catalogue/hostel-management/04.webp` | Utility bills | wide | 1440×960 | 41,768 |
| `hostel-management` | `assets/catalogue/hostel-management/05.webp` | Log a complaint | wide | 1440×960 | 31,354 |
| `hostel-management` | `assets/catalogue/hostel-management/06.webp` | Lease monitor | wide | 1440×960 | 102,040 |
| `hostel-management` | `assets/catalogue/hostel-management/07.webp` | Staff and roles | wide | 1440×960 | 44,416 |
| `hostel-management` | `assets/catalogue/hostel-management/08.webp` | Yearly account | wide | 1440×960 | 39,446 |
| `school-management` | `assets/catalogue/school-management/01.webp` | Students, added singly or in bulk | panel | 800×600 | 32,122 |
| `school-management` | `assets/catalogue/school-management/02.webp` | Staff and roles | panel | 800×600 | 16,962 |
| `school-management` | `assets/catalogue/school-management/03.webp` | Attendance | panel | 800×600 | 39,448 |
| `school-management` | `assets/catalogue/school-management/04.webp` | Timetable | panel | 800×600 | 43,766 |
| `school-management` | `assets/catalogue/school-management/05.webp` | Exams and marks | panel | 800×600 | 22,434 |
| `school-management` | `assets/catalogue/school-management/06.webp` | Fees | panel | 800×600 | 28,250 |
| `school-management` | `assets/catalogue/school-management/07.webp` | Announcements | panel | 800×600 | 27,416 |
| `school-management` | `assets/catalogue/school-management/08.webp` | What a parent and a student see | panel | 800×700 | 44,674 |
| `cambcard` | `assets/catalogue/cambcard/01.webp` | Fitness and personal training | portrait | 576×1461 | 94,766 |
| `cambcard` | `assets/catalogue/cambcard/02.webp` | Clinics and practitioners | portrait | 576×1505 | 99,876 |
| `cambcard` | `assets/catalogue/cambcard/03.webp` | Events and hospitality | portrait | 576×1452 | 143,132 |
| `cambcard` | `assets/catalogue/cambcard/04.webp` | Salons and studios | portrait | 576×1450 | 96,742 |
| `cambcard` | `assets/catalogue/cambcard/05.webp` | Legal and professional services | portrait | 576×1449 | 111,144 |
| `cambcard` | `assets/catalogue/cambcard/06.webp` | Technology and development | portrait | 576×1449 | 127,290 |
| `cambcard` | `assets/catalogue/cambcard/07.webp` | Design and creative | portrait | 576×1489 | 87,606 |
| `property-management` | `assets/catalogue/property-management/01.webp` | Dashboard | wide | 1440×753 | 52,246 |
| `property-management` | `assets/catalogue/property-management/02.webp` | Properties | wide | 1440×810 | 242,710 |
| `property-management` | `assets/catalogue/property-management/03.webp` | Property detail | wide | 1440×810 | 133,518 |
| `property-management` | `assets/catalogue/property-management/04.webp` | Tenants | wide | 1440×810 | 98,132 |
| `property-management` | `assets/catalogue/property-management/05.webp` | Invoices | wide | 1440×810 | 48,916 |
| `property-management` | `assets/catalogue/property-management/06.webp` | Units | wide | 1440×810 | 65,334 |
| `gym-management` | `assets/catalogue/gym-management/01.webp` | Dashboard: income against expenses | wide | 1440×810 | 62,196 |
| `gym-management` | `assets/catalogue/gym-management/02.webp` | Trainers | wide | 1440×810 | 62,036 |
| `gym-management` | `assets/catalogue/gym-management/03.webp` | Classes | wide | 1440×810 | 53,506 |
| `gym-management` | `assets/catalogue/gym-management/04.webp` | Invoice detail | wide | 1440×810 | 53,986 |
| `gym-management` | `assets/catalogue/gym-management/05.webp` | Expenses | wide | 1440×810 | 51,938 |
| `gym-management` | `assets/catalogue/gym-management/06.webp` | Attendance | wide | 1440×810 | 69,728 |
| `parking-management` | `assets/catalogue/parking-management/01.webp` | Dashboard: slots and income flow | wide | 1440×810 | 49,200 |
| `parking-management` | `assets/catalogue/parking-management/02.webp` | Parking | wide | 1440×810 | 67,158 |
| `parking-management` | `assets/catalogue/parking-management/03.webp` | Parking zones | wide | 1440×810 | 46,918 |
| `parking-management` | `assets/catalogue/parking-management/04.webp` | Parking detail | wide | 1440×810 | 44,090 |
| `parking-management` | `assets/catalogue/parking-management/05.webp` | Parking slots | wide | 1440×810 | 47,264 |
| `parking-management` | `assets/catalogue/parking-management/06.webp` | Roles and permissions | wide | 1440×810 | 47,410 |
| `customer-relationship-management` | `assets/catalogue/customer-relationship-management/01.webp` | Dashboard: income against expenses | panel | 970×600 | 42,462 |
| `customer-relationship-management` | `assets/catalogue/customer-relationship-management/02.webp` | Project progress | panel | 1054×600 | 36,648 |
| `customer-relationship-management` | `assets/catalogue/customer-relationship-management/03.webp` | Tasks | panel | 970×600 | 38,760 |
| `customer-relationship-management` | `assets/catalogue/customer-relationship-management/04.webp` | Clients | panel | 970×600 | 41,926 |
| `travel-booking` | `assets/catalogue/travel-booking/01.webp` | Pricing, person types and availability | wide | 1440×1192 | 47,424 |
| `travel-booking` | `assets/catalogue/travel-booking/02.webp` | Menu builder | wide | 1440×861 | 41,508 |
| `travel-booking` | `assets/catalogue/travel-booking/03.webp` | Page and template builder | wide | 1440×795 | 43,232 |
| `travel-booking` | `assets/catalogue/travel-booking/04.webp` | Theme options | wide | 1363×723 | 83,444 |
| `learning-management` | `assets/catalogue/learning-management/01.webp` | Assignment submission | panel | 984×600 | 15,374 |
| `learning-management` | `assets/catalogue/learning-management/02.webp` | Course discussion | panel | 984×600 | 9,860 |
| `learning-management` | `assets/catalogue/learning-management/03.webp` | Certificate | panel | 1440×647 | 54,446 |

## Product marks: `assets/marks/<slug>.svg`

Nine standalone vectors, 160 × 120, one per product. They are the same drawings the site renders
inline from `system-mark.tsx`, exported with colours resolved:

| Part | In the SVG | Change to |
| --- | --- | --- |
| Structure (lines, outlines) | `currentColor`, with `color:#5B7088` on the root | Any neutral; or remove the root style and let CSS set `color` |
| Filled tiles (in use) | `fill="#1268C4"` | Cambridge Marketing accent |
| Empty tiles (available) | `currentColor` at `fill-opacity="0.14"` | Usually leave as is |
| Pulse order | `data-fill-index="n"` on each tile | Keep, if rebuilding the hover pulse |

Strokes are `vector-effect="non-scaling-stroke"`, so lines stay hairline at any size. For the site
itself, the inline React component is the better source: it inherits colour from CSS and supports the
pulse. The SVG files are for design tools, decks and non-React builds.

## Fonts

Not included as files. **Inter** and **Instrument Serif** are Google Fonts (SIL Open Font License);
load them from Google Fonts or your framework's font loader, or map the font tokens to Cambridge
Marketing's own typefaces. The mono face is a system stack and needs no file.

## Other drawn elements

There are no other images, icons or background files. Everything else is drawn in CSS:

- the hero monitor (bezel, glass, neck, foot) in `system-wall.module.css`;
- the 16px ruled grid behind the marks (`linear-gradient` with `--cambt-line-grid`);
- the concentric-circle motif and drifting strands on the blue CTA band (`.cta` in `editorial.module.css`);
- list bullets and section-head rules (pseudo-elements).

## Screenshots: `screenshots/`

Full-page captures of the current production site, in the order the index lists the products:

| File prefix | Page |
| --- | --- |
| `00-products-index` | `/products` |
| `01-hostel-management` | `/products/hostel-management` (Hostel and room management system) |
| `02-school-management` | `/products/school-management` (School management system) |
| `03-cambcard` | `/products/cambcard` (CAMBCARD (vCard)) |
| `04-property-management` | `/products/property-management` (Property and tenant management system) |
| `05-gym-management` | `/products/gym-management` (Gym and fitness centre system) |
| `06-parking-management` | `/products/parking-management` (Vehicle parking management system) |
| `07-customer-relationship-management` | `/products/customer-relationship-management` (Client, project and invoicing system) |
| `08-travel-booking` | `/products/travel-booking` (Travel and tourism booking system) |
| `09-learning-management` | `/products/learning-management` (Online learning management system) |

Each page has three captures: `--desktop-dark.jpg` and `--desktop-light.jpg` at 1440px wide, and
`--mobile-dark.jpg` at 390px. They were taken with reduced motion on, so every section is in its
final, fully revealed state; the site chrome's robot assistant is hidden. The site header and footer
in the captures are Cambridge Technology's and are not part of this package.

Interaction states, with motion on:

| File | Shows |
| --- | --- |
| `interaction-01-hero-wall-hover.png` | Hero wall with the Gym tile hovered: lifted, lit, mark pulsing |
| `interaction-02-index-card-hover.png` | An index card hovered: border lit, raised, plate tinted, spotlight |
| `interaction-03-index-filtered.png` | The index with an industry filter applied and the count updated |
| `interaction-04-fitted-field-pointer.png` | The fitted field with every line turned toward the cursor |
