# 04 · Content model

Three data files drive the whole section. Components hold no copy of their own.

| File | Holds |
| --- | --- |
| `source/app/(public)/_content/products.ts` | The nine product records (`Product`), in display order |
| `source/app/(public)/_content/product-screens.ts` | Each product's screens, in display order: file, caption, pixel size, format |
| `source/app/(public)/_content/products-page-content.ts` | Every heading, label, note and action on the index and detail pages |

Screens are deliberately **not** a field on the product record. They are joined by `slug`. On
cambt.com the product records and page copy can be overridden from a CMS, which replaces arrays
wholesale; keeping screens in code means a stale CMS record can never blank a product's gallery.

## The `Product` record

| Field | Type | Rendered as |
| --- | --- | --- |
| `slug` | string | URL `/products/<slug>`; joins screens and marks |
| `name` | string | Detail `h1`, index card link, wall tile accessible name |
| `shortName` | string or null | Wall tile label. Must be a substring of `name` (accessibility rule, label in name) |
| `positioning` | string | Index card line; detail lead fallback |
| `lead` | string or null | Detail hero paragraph |
| `category` | string | Index card meta; detail hero kicker |
| `published` | boolean | `false` removes it from the site entirely (every record here is `true`) |
| `depth` | `"full"` or `"lean"` | `full` shows B3 Solves, B5 Replaces and B6 Adapts; `lean` omits them |
| `evidence` | `"capture"` or `"illustration"` | Which note sits over the screens (all nine are captures) |
| `screenKind` | `"interface"` or `"theme"` | `theme` relabels B2 as "Themes / What your contact opens" (CAMBCARD) |
| `solves` | `{ title, body }[]` | B3 numbered list |
| `modules` | `{ name, body or null }[]` | B4 list; a null body shows the name alone (never invent one) |
| `replaces` | string[] | B5 list |
| `adapts` | string[] | B6 list |
| `suits` | string or null | B7 "Who it suits" |
| `industries` | string[] | B7 chips; also builds the index filter |
| `integrations` | string[] | B7 chips (all empty, so hidden) |
| `demoUrl`, `documentationUrl` | string or null | Hero actions; null hides them (all null) |
| `relatedServices` | `{ title, slug, relationship }[]` | B8; **Cambridge Technology service links: re-point or drop** |

The B-numbers refer to the detail page sections in `01-page-map.md`.

## Which product shows which section

Numbers are item counts. "Template" is `depth`. Screens are count and format.

| # | Product (slug) | Category | Template | Screens | Solves | Modules | Replaces | Adapts | Suits | Industries | Integrations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Hostel and room management system (`hostel-management`) | Property operations | full | 8 wide | 3 | 9 | 4 | 4 | yes | Property, Hospitality | — |
| 02 | School management system (`school-management`) | Education management | full | 8 panel | 3 | 13 | 4 | 4 | yes | Education | — |
| 03 | CAMBCARD (vCard) (`cambcard`) | Digital identity | full, themes | 7 portrait | 3 | 12 | 4 | 4 | yes | Professional services, Retail | — |
| 04 | Property and tenant management system (`property-management`) | Property operations | full | 6 wide | 3 | 6 | 4 | 4 | yes | Property | — |
| 05 | Gym and fitness centre system (`gym-management`) | Membership operations | full | 6 wide | 3 | 7 | 4 | 4 | yes | Fitness | — |
| 06 | Vehicle parking management system (`parking-management`) | Facility operations | full | 6 wide | 3 | 7 | 4 | 4 | yes | Facilities | — |
| 07 | Client, project and invoicing system (`customer-relationship-management`) | Commercial operations | lean | 4 panel | — | 6 | — | — | yes | Professional services | — |
| 08 | Travel and tourism booking system (`travel-booking`) | Booking and reservations | lean | 4 wide | — | 8 | — | — | yes | Travel | — |
| 09 | Online learning management system (`learning-management`) | Education | lean | 3 panel | — | 9 | — | — | yes | Education | — |

## Per product

### 01. Hostel and room management system

- Route: `/products/hostel-management` · Screenshots: `screenshots/01-hostel-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/hostel-management.svg` · Hero-wall label: **Hostel**
- Positioning (index card): Rooms, tenants, invoices and complaints for a hostel or small hotel.
- Screens, in order: 01 Add a room · 02 Add a tenant · 03 All invoices · 04 Utility bills · 05 Log a complaint · 06 Lease monitor · 07 Staff and roles · 08 Yearly account
- Related services: POS and ERP Systems, Software Development

### 02. School management system

- Route: `/products/school-management` · Screenshots: `screenshots/02-school-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/school-management.svg` · Hero-wall label: **School**
- Positioning (index card): Students, staff, attendance, exams and fees, with an app for parents.
- Screens, in order: 01 Students, added singly or in bulk · 02 Staff and roles · 03 Attendance · 04 Timetable · 05 Exams and marks · 06 Fees · 07 Announcements · 08 What a parent and a student see
- Related services: Software Development, Mobile App Development

### 03. CAMBCARD (vCard)

- Route: `/products/cambcard` · Screenshots: `screenshots/03-cambcard--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/cambcard.svg` · Hero-wall label: **CAMBCARD**
- Positioning (index card): A custom digital business card a contact can save, call or scan in one tap.
- Screens, in order: 01 Fitness and personal training · 02 Clinics and practitioners · 03 Events and hospitality · 04 Salons and studios · 05 Legal and professional services · 06 Technology and development · 07 Design and creative
- Related services: Website Development, UI/UX and Creative

### 04. Property and tenant management system

- Route: `/products/property-management` · Screenshots: `screenshots/04-property-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/property-management.svg` · Hero-wall label: **Property**
- Positioning (index card): Portfolios, units, tenants and rent collection for a managing agent.
- Screens, in order: 01 Dashboard · 02 Properties · 03 Property detail · 04 Tenants · 05 Invoices · 06 Units
- Related services: POS and ERP Systems, Software Development

### 05. Gym and fitness centre system

- Route: `/products/gym-management` · Screenshots: `screenshots/05-gym-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/gym-management.svg` · Hero-wall label: **Gym**
- Positioning (index card): Members, trainers, classes, attendance and subscription billing.
- Screens, in order: 01 Dashboard: income against expenses · 02 Trainers · 03 Classes · 04 Invoice detail · 05 Expenses · 06 Attendance
- Related services: POS and ERP Systems, Software Development

### 06. Vehicle parking management system

- Route: `/products/parking-management` · Screenshots: `screenshots/06-parking-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/parking-management.svg` · Hero-wall label: **Parking**
- Positioning (index card): Zones, slots, rates, registered vehicles and parking revenue.
- Screens, in order: 01 Dashboard: slots and income flow · 02 Parking · 03 Parking zones · 04 Parking detail · 05 Parking slots · 06 Roles and permissions
- Related services: POS and ERP Systems, Software Development

### 07. Client, project and invoicing system

- Route: `/products/customer-relationship-management` · Screenshots: `screenshots/07-customer-relationship-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/customer-relationship-management.svg` · Hero-wall label: **Client**
- Positioning (index card): Clients, leads, projects, tasks and invoicing in one record set.
- Screens, in order: 01 Dashboard: income against expenses · 02 Project progress · 03 Tasks · 04 Clients
- Related services: Software Development, Business Automation

### 08. Travel and tourism booking system

- Route: `/products/travel-booking` · Screenshots: `screenshots/08-travel-booking--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/travel-booking.svg` · Hero-wall label: **Travel**
- Positioning (index card): Tours, spaces and availability, with the public site built from the same records.
- Screens, in order: 01 Pricing, person types and availability · 02 Menu builder · 03 Page and template builder · 04 Theme options
- Related services: Website Development, Software Development

### 09. Online learning management system

- Route: `/products/learning-management` · Screenshots: `screenshots/09-learning-management--desktop-dark.jpg`, `--desktop-light.jpg`, `--mobile-dark.jpg`
- Mark: `assets/marks/learning-management.svg` · Hero-wall label: **Learning**
- Positioning (index card): Courses, assignments, discussion and certification, sold from the same site.
- Screens, in order: 01 Assignment submission · 02 Course discussion · 03 Certificate
- Related services: Website Development, Software Development

## Content rules to keep

- Describe a system; never name the third-party platform it came from. CAMBCARD is Cambridge's own
  brand and the only product with a name.
- Every screen is a real capture; every module is real. An empty field leaves its section out rather
  than showing placeholder text.
- The adaptation scenario (restaurant till in a grocery shop) is a generic illustration: no client
  named, no outcome claimed. Keep it that way.
- British English throughout.
