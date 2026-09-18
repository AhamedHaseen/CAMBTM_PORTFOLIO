# Cambridge Marketing (CAMBM) — Enterprise Web Platform

An enterprise-grade, high-performance web platform for **Cambridge Marketing (PVT) Ltd.** built to showcase connected marketing systems, software products, bespoke client packages, and a comprehensive Studio Administration suite.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack & Libraries](#technology-stack--libraries)
3. [Architecture & System Structure](#architecture--system-structure)
4. [File & Directory Anatomy](#file--directory-anatomy)
5. [Core Features & Key Modules](#core-features--key-modules)
   - [1. Landing Page (Welcome)](#1-landing-page-welcome)
   - [2. Products & Live Reference Systems](#2-products--live-reference-systems)
   - [3. Packages & Custom Scope Builder](#3-packages--custom-scope-builder)
   - [4. About Page & Story Chapters](#4-about-page--story-chapters)
   - [5. Studio CMS & Admin Suite](#5-studio-cms--admin-suite)
   - [6. Internationalization (i18n) Engine](#6-internationalization-i18n-engine)
   - [7. Design System & Theme Engine](#7-design-system--theme-engine)
6. [Booking & Cal.com Integration](#booking--calcom-integration)
7. [Installation & Getting Started](#installation--getting-started)
8. [Available Scripts](#available-scripts)
9. [Developer Conventions & Best Practices](#developer-conventions--best-practices)

---

## Project Overview

**Cambridge Marketing (CAMBM)** bridges the gap between digital marketing, creative branding, and operational software infrastructure. The website provides an interactive experience illustrating:
- **Connected Systems:** How marketing, sales funnels, point-of-sale (POS), enterprise resource planning (ERP), and AI automation link together.
- **Tailored Systems vs Generic Software:** Side-by-side architectural arguments demonstrating why generic software creates friction and how CAMBM fits software to the business.
- **Interactive System Mark Visuals:** SVG schematics with synchronized wave animations reflecting active and available system capacity.
- **Multi-language Support:** Full native support for 5 languages: English (`en`), Spanish (`es`), Arabic (`ar` with automatic RTL mirroring), Sinhala (`si`), and Tamil (`ta`).

---

## Technology Stack & Libraries

### Frontend
- **Framework:** [React 19](https://react.dev/) (`^19.2.8`) & [React DOM](https://reactjs.org/)
- **Routing:** [React Router 7](https://reactrouter.com/) (`^7.18.3`) (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Build Tool & Bundler:** [Vite 8](https://vitejs.dev/) (`^8.2.2`) with `@vitejs/plugin-react`
- **Animations & Motion:** [Motion](https://motion.dev/) (`motion/react` `^13.2.0`) & Custom requestAnimationFrame (rAF) CSS transitions
- **Iconography:** [Lucide React](https://lucide.dev/) (`^1.41.0`) & Custom vector SVG architectural marks
- **Typography:** Instrument Serif (Editorial Display Serif), Inter & Inter Tight (Sans-Serif)
- **Styling:** Modular Vanilla CSS design tokens with CSS Logical Properties (`inset-inline`, `padding-inline`) for automated RTL support.

### Backend & Studio CMS Server
- **Runtime:** Node.js (ES Module format)
- **Web Framework:** [Express 5](https://expressjs.com/) (`^5.2.1`)
- **Database Support:** [SQLite3](https://github.com/TryGhost/node-sqlite3) (`^6.0.1`) & [PostgreSQL](https://node-postgres.com/) (`pg` `^8.23.0`) with [Supabase](https://supabase.com/) (`@supabase/supabase-js` `^2.115.0`)
- **Authentication & Security:** JWT (`jsonwebtoken` `^9.0.3`), `bcryptjs` (`^3.0.3`), `cookie-parser`, `helmet` (`^8.3.0`), `cors`, and `express-rate-limit`
- **Media Uploads:** `multer` (`^2.3.0`)
- **Email Dispatch:** `nodemailer` (`^10.0.0`)
- **Process Orchestration:** `concurrently` (`^10.0.5`)

---

## Architecture & System Structure

```
CAMBM-website-UNEE/
├── public/                     # Public assets & static scripts
│   ├── css/                    # Static runtime CSS & animations
│   ├── images/                 # Brand assets, logos & photos
│   ├── js/
│   │   ├── i18n.js             # Global 5-language translation dictionary & DOM binder
│   │   ├── main.js             # Lenis smooth scroll, magnetic controls & cursor effects
│   │   └── cal-widget.js       # Cal.com scheduling embed integration
│   └── videos/                 # High-resolution demo and showcase MP4s
├── server/                     # Backend API & Admin CMS Services
│   ├── config/                 # Database configuration (SQLite / PostgreSQL / Supabase)
│   ├── middleware/             # JWT Auth, Rate Limiter & Error handlers
│   ├── models/                 # Database schema models & queries
│   ├── routes/                 # Express API routes (services, combos, contacts, auth, media, audit)
│   ├── scripts/                # Database migration and seed scripts (init-db.js)
│   └── server.js               # Express application entrypoint (Port 5000 / Dynamic)
├── src/
│   ├── admin/                  # Studio CMS Suite (Protected React Dashboard)
│   │   ├── components/         # Admin layout, sidebar, modal & toast notifications
│   │   ├── context/            # AuthContext (JWT state, login/logout session handling)
│   │   └── pages/              # Admin view controllers (Dashboard, Services, Combos, etc.)
│   ├── assets/                 # SVGs and bundled local assets
│   ├── components/             # Reusable UI component library
│   │   ├── about/              # About story timeline and chapter components
│   │   ├── home/               # Hero bento, brand marquee, comparison sections
│   │   ├── portfolio/          # Project cards, gallery & filter dialogs
│   │   ├── products/           # SystemWall, SystemMark, AdaptationArgument, FittedField, SystemIndex
│   │   ├── CtaSection.jsx      # Universal CTA banner ("Ready to grow your business?")
│   │   ├── Header.jsx          # Fixed navigation header with theme & locale switchers
│   │   ├── FooterOffices.jsx   # Global multi-region office address blocks
│   │   ├── FooterSocials.jsx   # Dynamic localized social media channel links
│   │   └── ServicesSection.jsx # BUILD / CREATE / GROW dynamic interactive services tabs
│   ├── content/                # Content models, catalogues, and localization data
│   │   └── products/
│   │       ├── productsData.js        # Full 9 Reference Systems deep metadata
│   │       ├── productScreensData.js  # Live UI screen capture definitions
│   │       └── productsPageContent.js # Multi-language copy for /products
│   ├── css/                    # Master CSS stylesheets
│   │   ├── main.css            # Root design system tokens, typography, dark/light themes
│   │   ├── animations.css      # Keyframes for pulses, fades, and magnetic glows
│   │   ├── products.css        # Products index, system marks, and 3D monitor styles
│   │   ├── services-redesign.css # Services directory, hosting table, and combo packages
│   │   └── our-pricing.css     # Packages and custom scope builder styles
│   ├── pages/                  # Top-level Page Views
│   │   ├── Welcome.jsx         # Main Landing Page (Hero, Brands, Why Us, Services, FAQ)
│   │   ├── Products.jsx        # Products Index Page (/products)
│   │   ├── ProductDetail.jsx   # Individual System Detail View (/products/:slug)
│   │   ├── OurPricing.jsx      # Packages & Custom Scope Builder (/packages)
│   │   ├── CustomPlan.jsx      # Review & Cart Summary (/custom-plan)
│   │   ├── About.jsx           # About Us Story & Timeline (/about)
│   │   └── Portfolio.jsx       # Case studies and creative portfolio
│   ├── App.jsx                 # Main application router and global lifecycle listeners
│   └── main.jsx                # React root mount point
├── package.json
└── vite.config.js
```

---

## Core Features & Key Modules

### 1. Landing Page (`Welcome.jsx`)
- **Hero Section:** Infinite-loop dual-column video sliders (`makeLoopSlider()`) showcasing client productions.
- **Brand Trust Marquee:** Seamless, delta-timed marquee displaying client logos and partners.
- **The Connected System (`#ai`):** Conceptual breakdown of the 6 core pillars of CAMBM operations.
- **Why CAMBM (`#why-CAMBM`):** Direct comparative matrix evaluating *In-House vs. Traditional Agency vs. Cambridge Marketing*.
- **Integrated Pre-Built Packages:** Fast access to Videography, Website, and POS packages with instant strategy call booking.

### 2. Products & Live Reference Systems (`Products.jsx` & `ProductDetail.jsx`)
- **Interactive 3D System Wall (`SystemWall.jsx`):** A responsive 3D monitor bezel displaying 9 live system tiles in a 3x3 grid with mouse perspective tilt.
- **System Mark SVGs (`SystemMark.jsx`):** Architectural vector marks that visually represent system occupancy:
  1. *Hostel Management* (`Rooms`): 12-room floor plan with corridor.
  2. *School Management System* (`Timetable`): 5-day × 4-period class schedule grid.
  3. *CAMBCARD* (`Card`): Digital NFC business card with avatar, tap pill lines, and QR code module.
  4. *Property Management* (`Portfolio`): Architectural skyline towers with let unit storeys.
  5. *Gym Management* (`Weights`): Symmetrical barbell with stacked weight plates.
  6. *Parking Management* (`Bays`): Dual-sided angled parking slots.
  7. *Travel Booking* (`Route`): Journey waypoints and itinerary route stops.
  8. *Learning Management System* (`Modules`): Stacked curriculum syllabus modules with progress fill.
  9. *Customer Relationship Management* (`Pipeline`): Funnel stages narrowing from enquiry to invoice.
- **Hover Wave Animation:** Empty structural slots (`.m`) smoothly wave in sequence with brand glow (`#ff5a00`) when cards are hovered.
- **Differentiation Diptych (`AdaptationArgument.jsx`):**
  - *Left Card (A system built for someone else):* Generic restaurant till in a grocery store (4 unused fields skipped daily).
  - *Right Card (A system built for you):* Tailored grocery system (6 matching kept fields, 0 fields skipped).
- **Delivery Section (`FittedField.jsx`):** 9x6 compass grid tracking pointer coordinates in real-time, plus 4 Delivery Principle cards with subtle hover zoom.
- **Filterable Catalogue (`SystemIndex.jsx`):** Filter 9 reference systems by industry (Education, Retail, Hospitality, Real Estate, Fitness, Travel) with search and deep detail routing (`/products/:slug`).
- **Live System Demo Modal (`LiveSystemModal.jsx`):** Interactive screen capture viewer with zoom, slide navigation, and high-resolution previews.

### 3. Packages & Custom Scope Builder (`OurPricing.jsx` & `CustomPlan.jsx`)
- **Pre-Built Packages:**
  - *Videography Package (Monthly Plan)*
  - *Website Package (6-Month Plan)*
  - *POS Package (Annual Plan)*
- **Interactive Custom Scope Builder:**
  - Tabbed selection: **BUILD**, **CREATE**, and **GROW**.
  - Add/remove any service with instant quantity tracking.
  - **Zero-Bug Multi-Language Sync:** Service selection is tracked by unique identifiers (`category-num`), preventing duplicates when switching between languages.
  - **Dynamic Localization:** Selected service chips automatically update their display names to the active language.
  - **Clean Cal.com Booking Payload:** Automatically pre-selects the `"Select a package"` dropdown in Cal.com while maintaining a clean, empty Additional Notes field for user input.

### 4. About Page (`About.jsx`)
Organized as 7 numbered chapters (`.about-chapter-num`):
- `01` **Our Story:** Foundation and agency genesis.
- `02` **Built From Technology:** Tech-first engineering background.
- `03` **The Connected System (`#about-systems`):** 4-stage operational flow (*Attract → Convert → Operate → Retain*).
- `04` **Why CAMBM (`#about-why`):** Six key structural differentiators.
- `05` **How We Work (`#about-process`):** 4-step execution framework.
- `06` **What We Stand For (`#about-values`):** Core corporate values.
- `07` **Built Local, Designed Global (`#about-global`):** Horizontal roadmap spanning Middle East, Sri Lanka, India, and Europe.

### 5. Studio CMS & Admin Suite (`src/admin/*`)
A full-featured management backend accessible via `/admin` or `/studio`:
- **Dashboard (`Dashboard.jsx`):** Real-time analytics, revenue metrics, conversion KPIs, and system health status.
- **Services Manager (`ServicesManager.jsx`):** Create, reorder, edit, and toggle active status of BUILD, CREATE, and GROW capabilities.
- **Combo Packages Manager (`ComboPackagesManager.jsx`):** Configure pre-built packages, deliverables, pricing, and promotional badges.
- **Hero Bento Manager (`HeroBentoManager.jsx`):** Upload, assign, and preview hero grid videos and titles.
- **Brands Manager (`BrandsManager.jsx`):** Manage trust partner logos and brand descriptions.
- **Contact & Enquiries Manager (`ContactManager.jsx`):** Review incoming strategy call requests and custom scope submissions.
- **Media Library (`MediaLibrary.jsx`):** Centralized asset repository with file uploads, tags, and CDN paths.
- **Audit Logs & Security (`AuditLogs.jsx`, `LoginHistory.jsx`):** Track administrative actions, IP addresses, and authentication events.
- **User Management (`UsersManager.jsx`):** Role-based access control (Super Admin, Editor, Viewer).

### 6. Internationalization (i18n) Engine
- **Supported Languages:**
  - `en` — English (Default)
  - `es` — Spanish (Español)
  - `ar` — Arabic (العربية, with `dir="rtl"` logical layout inversion)
  - `si` — Sinhala (සිංහල)
  - `ta` — Tamil (தமிழ்)
- **Architecture:** Dual-layer architecture:
  1. `public/js/i18n.js`: Fast runtime DOM node replacement (`data-i18n`, `data-i18n-attr`) for static elements and header/footer controls.
  2. React Context & Hooks (`I18N_SERVICES`, `I18N_PRODUCTS_PAGE`, `I18N_PRICING_PAGE`): Reactive re-rendering on `cambm:localechange` events.
- **Country & Currency Pairing:** Automatically binds regional currencies (USD, SAR, AED, LKR, INR, EUR, GBP) to localized views.

### 7. Design System & Theme Engine
- **Default Theme:** Dark Mode (Tailored system mood palette with deep charcoal canvas `#2a2a2a`, elevated card surfaces `#464646`, and electric brand orange `#ff5a00`).
- **Light Theme Support:** Activated via `[data-theme="light"]`, providing crisp high-contrast cards, neutral borders, and refined text hierarchy (`#484848`).
- **Typography Tokens:**
  - Display & Headings: `Instrument Serif`, Georgia, serif
  - Body & Microcopy: `Inter`, `Inter Tight`, sans-serif
- **Accessibility:** Respects `prefers-reduced-motion` for ambient effects while maintaining smooth programmatic navigation via custom rAF easing (`smoothScrollTo`).

---

## Booking & Cal.com Integration

Scheduling is powered by [Cal.com](https://cal.com/cambridge.marketing).
- **Package Preselection:** Pre-selects package items in the dropdown (`Videography Package`, `Website Package`, `POS Package`, or `Custom`) across all 5 languages using the `getCanonicalPackageName` resolver.
- **Custom Scope Handshake:** Formats custom selections into a formatted notes summary and launches the Cal scheduling modal seamlessly.
- **Fallback Resilience:** Automatically falls back to DOM trigger clicks or direct Cal tab launches if the embed script is blocked by browser privacy shields.

---

## Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or 20.x recommended)
- [npm](https://www.npmjs.com/) (version 9.x or higher)

### Setup Steps
1. **Clone or navigate to the repository:**
   ```bash
   cd CAMBM-website-UNEE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the local database (for Studio CMS):**
   ```bash
   npm run db:init
   ```

4. **Start the development servers (Frontend + Backend):**
   ```bash
   npm run dev:all
   ```
   - Frontend available at: `http://localhost:5173`
   - Backend API running at: `http://localhost:5000`

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server for the React frontend. |
| `npm run server` | Starts the Express Node.js backend server. |
| `npm run dev:all` | Concurrently runs both the Express backend and the Vite frontend. |
| `npm run db:init` | Executes database migration and creates default seed data. |
| `npm run build` | Compiles and bundles production assets into `/dist`. |
| `npm run preview` | Locally previews the production build output. |
| `npm run lint` | Runs `oxlint` for lightning-fast code analysis. |

---

## Developer Conventions & Best Practices

1. **Adding User-Visible Strings (i18n):**
   - Whenever you add or modify a string, update **all 5 language dictionaries** (`en`, `es`, `ar`, `si`, `ta`) in `public/js/i18n.js` and relevant content files in `src/content/`.
2. **CSS Logical Properties:**
   - Always use `padding-inline`, `margin-inline`, and `inset-inline` instead of `left`/`right` properties to ensure seamless Arabic (`dir="rtl"`) layout rendering.
3. **System Mark Architecture:**
   - When designing or editing SVGs in `SystemMark.jsx`, ensure slots use `tile(index, isFilled)` so that empty placeholders (`.m`) and filled elements (`.f`) participate in the wave hover cycle.
4. **Cal.com Modal Arguments:**
   - Always route package names through `getCanonicalPackageName` to ensure Cal.com dropdowns pre-select accurately regardless of the visitor's selected language.
5. **No Framework Lock-in for Shared Scripts:**
   - Header, footer, theme toggles, and locale selection are written to work consistently across both static pages and React dynamic routes.

---

## License & Credits

&copy; 2026 **Cambridge Marketing (PVT) Ltd.** All rights reserved.
Built and maintained by the Cambridge Technology & Growth Engineering Team.