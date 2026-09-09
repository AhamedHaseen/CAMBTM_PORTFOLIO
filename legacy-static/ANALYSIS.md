# Site Analysis (reference doc — read this instead of re-scanning the whole repo)

Static multi-page-less single-page site for **Cambridge Marketing (CAMBM)**, a Sri Lanka-based
agency pitching "marketing + technology under one roof" (social/ads/creative + websites/POS/ERP).
Visual style is a close clone of superside.com (see `superside-clone-README.md` for the full
design-system breakdown: colors, animations, spacing — still accurate as a reference, though the
actual clone HTML/CSS files it originally described are gone; only `index.html`/`css/`/`js/` remain).

## Stack
Plain HTML/CSS/JS, no build step, no framework, no dependencies.
`server.js` is a zero-dependency Node static file server (port 8080) for local preview only
(`start-server.bat` / `start-server-silent.vbs` launch it). Deployed via GitHub Pages
(`.github` workflow per recent commit history).

## File map
- `index.html` (762 lines) — all markup, single page, sections linked via anchors.
- `css/main.css` (1762 lines) — design tokens + layout/components. Dark theme base:
  `--bg:#0a0a0a`, `--bg-light:#efe9dd`, `--text:#f5f4ef`, `--accent:#e3752f` (orange, not the
  original superside purple), container 1280px, header height 64px.
- `css/animations.css` (601 lines) — scroll-reveal, marquee, hover/noise animations.
- `js/main.js` (666 lines) — all interactivity, vanilla JS, no libraries:
  - header scroll/parallax (rAF-throttled), eased scroll-to-top
  - mobile nav toggle + backdrop
  - custom cursor (`animateCursor`)
  - bento client-image popup (`openClientPopup`/`closeClientPopup`) — click a hero gallery image to see client name
  - `makeLoopSlider` — infinite auto-scroll loop slider (used for hero bento columns / brand marquee), speed-adjusts on interaction
  - smooth-scroll anchor links
  - typewriter effect, counter animation, IntersectionObserver blur-in reveals
  - contact form → posts to **Formspree** (`https://formspree.io/f/mjgqjpzn`), no backend
- `js/i18n.js` (668 lines) — self-contained country/language/currency module:
  - Countries: LK (Sri Lanka, default), SA (Saudi Arabia), IN (India), EU
  - Languages: en (default), ar, si, ta, es — RTL only for `ar`
  - Per-country pricing in local currency, hardcoded in `PACKAGE_PRICES` (no live FX conversion)
  - `PACKAGE_FEATURES` per-country override object exists but is empty — all countries currently share the same English-authored feature list translated per language
  - Drives `data-i18n` attributes throughout `index.html`; some keys use innerHTML (`HTML_KEYS`) because they contain `<em>`/`<br>`
  - First-visit mandatory locale popup, persisted to `localStorage` under `cambm_locale`
- `images/brand-creatives/` — 12 real client creative images used in the hero "bento" gallery
- `images/brands/` — ~20 client logos used in the two infinite marquee rows
- `images/services/` — 6 stock-style images for a Services section that is currently commented out
- `.claude/launch.json` — preview server config for the Claude Code preview tool

## Page sections (in order)
1. **Header** — logo, nav (Systems / Why CAMBM / Pricing), country+language pickers, "Book a strategy call" (mailto), hamburger mobile nav
2. **Hero** (`#hero`) — "Beyond Social Media." headline, 3 stats (500+/98%/24h), 3-column auto-scrolling bento gallery of real client creatives (clickable → popup with client name)
3. **Trusted Brands** (`#brands`) — two marquee rows of ~20 client logos
4. **Systems / AI Creative** (`#ai`) — 6 feature cards: Brand & Creative Systems, Social Media & Ads, Websites & Landing Pages, POS & ERP Development, Automation & Lead Flow, Reports & Growth Tracking
5. **Differentiator** (`#why-us`) — "Most agencies stop at the post. We don't." + 3 points (one team end-to-end, marketing meets operations, readable results)
6. ~~Services section~~ — HTML present but fully commented out (lines ~336-405)
7. ~~"What We Do" section~~ — also commented out (~407-446)
8. **Comparison table** (`#why-CAMBM`) — CAMBM vs Hiring In-House vs Traditional Outsourcing, 7 rows (Strategy, Creative, Management, Website, POS Software, ERP, Scalability, Accountability)
9. **Pricing** (`#pricing`) — 3 tiers: Signature (LKR 49,000/mo, min 3-month), Prestige (LKR 89,000/mo, annual, "Recommended"), Elite (LKR 129,000/mo, annual) + Enterprise CTA opening a contact-form popup
10. ~~Testimonials~~ — commented out (Hijaz, Onex Roze, Crane Shoes quotes drafted but unused)
11. **CTA** (`#cta`) — "Ready to grow your business, the right way?"
12. **Footer** — logo, copyright, social icons (Instagram/Facebook/LinkedIn live; X/TikTok commented out). The 4-column link footer (Services/Company/Resources) is present but `display:none` and all links are placeholder `#`.

## Popups / modals
- **Client popup** — bento image click → shows image + client name
- **Locale popup** — mandatory on first visit, country+language selection, persisted in localStorage
- **Contact popup** (`js-open-contact-popup`, triggered from Pricing → Enterprise) — name/email/company/phone/message form, client-side validated, submits to Formspree

## Known incomplete/placeholder areas (as of last read)
- Services, "What We Do," and Testimonials sections are fully built but commented out of the DOM
- Footer's 4-column link section is hidden (`display:none`) and its links are all `#`
- Social icons for X/TikTok are commented out
- `PACKAGE_FEATURES` per-country content override is scaffolded but empty (all countries share one feature set)
- `images/services/` (6 images) only referenced by the commented-out Services section
- Contact email throughout: `cambridge.marketing.co@gmail.com`

## Do not need to re-derive
- Design tokens, animation names, and the full superside.com feature list are already documented in `superside-clone-README.md`.
- This file (`ANALYSIS.md`) reflects the state of the repo as read on 2026-07-06; re-check specific
  files before relying on line numbers or exact copy if significant time has passed.
