# Cambridge Marketing Portfolio

## Summary

Create `portfolio.html` as a premium **Luxury Atlas** portfolio page inspired by the editorial hierarchy and project-browsing patterns of the Takitro portfolio while remaining visually native to Cambridge Marketing.

The page uses the current dark theme, Instrument Serif/Inter typography, Cambridge orange, existing header/footer, locale controls, Cal.com booking flow, RTL support, and responsive conventions.

## Design System

- Use a dark minimalist canvas with warm ivory typography, muted borders, Cambridge orange coordinate accents, subtle glass surfaces, and generous whitespace.
- Lead with a full-height oversized translated **PORTFOLIO** wordmark, project count, atlas-style coordinates, and restrained animated grid lines.
- Use refined cinematic motion for section reveals, project-card morphing, filter transitions, and map zooms.
- Use neutral labeled image frames in varied editorial ratios until real project images are supplied.
- Keep the portfolio visually integrated with the current site rather than copying the reference design.

## Navigation

- Replace **Systems** with **Portfolio** in the second navbar position.
- Final order: Home, Portfolio, Why CAMBM, Packages, About.
- Apply the change to desktop and mobile navigation in `welcome.html`, `about.html`, and `portfolio.html`.
- Keep the existing Systems section on the landing page; only remove its direct navbar item.
- Mark Portfolio as active on `portfolio.html`.
- Add `nav.portfolio` translations in English, Spanish, Arabic, Sinhala, and Tamil.

## Portfolio Structure

### Hero

- Full-height oversized portfolio title.
- Small “Selected Work” eyebrow and `08 Projects` index.
- Short placeholder introduction explaining the range of services.
- Animated scroll cue leading into the project atlas.

### Project Atlas

- Use an asymmetric 12-column editorial layout with varied card sizes and aspect ratios.
- Include eight initial placeholder projects: Myra, Hijaz, Uneeflow, Al Fakhir, Mahanama, Lucky Darbar, Crane Shoes, and Fly Bagdad.
- Each collapsed card shows the brand, project index, neutral image frame, short teaser, service tags, industry tag, and market tag.
- Cards use real brand names but polished placeholder narratives and `XX`-style placeholder outcomes.

### Filters and Tags

- Service filters: All, Websites, Systems, Branding, Social Media, Campaigns, Automation.
- Filter chips toggle independently and support single- and multi-selection.
- An **Any / All** control switches between matching any selected service and matching every selected service.
- All clears the active filter set.
- Display a translated live project count and empty-result state.
- Industry and market tags remain informational.

### Expandable Case Files

- Only one case study can be open at a time.
- Opening a project smoothly morphs its card into a full-width editorial case file.
- Each case file contains Overview, Challenge, Approach, Services, Deliverables, three placeholder outcome metrics, four neutral image frames, previous/next navigation, and the existing Cal.com strategy-call CTA.
- Use `portfolio.html#project-id` deep links.
- Direct hash visits clear conflicting filters, reveal the project, open it, and focus its heading.
- Browser back/forward restores case-file state.
- If filtering removes the open project, close it and clear the hash.
- Previous/next navigation follows the current filtered order, falling back to the complete project order.

## Project Content Registry

Create a browser-ready registry at `assets/data/portfolio-data.js` so cards, filters, case files, and map markers are generated from one source without relying on runtime JSON requests.

Each project contains a stable ID, brand name, layout variant, service IDs, industry and market IDs, location IDs, world/country map positions, cover/gallery paths, and translation-key prefix.

All visible project narratives remain in the five language blocks in `js/i18n.js`.

Add a dependency-free validation utility and an add-project checklist:

1. Add the registry entry.
2. Add English, Spanish, Arabic, Sinhala, and Tamil keys.
3. Add cover/gallery assets and alt text.
4. Add map coordinates.
5. Run the validator.

Fallbacks render a neutral frame for missing images, English for missing optional copy, translated “Other” for missing services, omit unlocated projects from the map, skip missing/duplicate IDs with actionable errors, and retain the page shell with a localized unavailable state if the registry fails.

## Placeholder Project Mapping

- Myra — Colombo, Sri Lanka — Branding, Social Media, Campaigns
- Hijaz — Kandy, Sri Lanka — Branding, Social Media, Campaigns
- Mahanama — Galle, Sri Lanka — Websites, Branding, Campaigns
- Lucky Darbar — Negombo, Sri Lanka — Branding, Social Media, Campaigns
- Uneeflow — Dubai, UAE — Websites, Systems, Automation
- Al Fakhir — Riyadh, Saudi Arabia — Branding, Social Media, Campaigns
- Crane Shoes — Chennai, India — Websites, Branding, Social Media
- Fly Bagdad — Baghdad, Iraq — Websites, Campaigns, Automation

## Interactive Project Map

End the page with a **Warm Ivory Finale** containing a dependency-free, two-level interactive SVG atlas.

- World view shows the complete map and orange country clusters with project counts.
- Clicking or keyboard-activating a country smoothly zooms into it.
- Country view fades surrounding geography and reveals city markers with a short stagger.
- A visible keyboard-accessible Back button returns to the world view.
- Selecting a marker opens a compact preview with brand, city/country, teaser, and a View Case Study button.
- On mobile, the preview appears below the map.
- View Case Study scrolls to the atlas, opens the matching case file, updates the hash, and focuses its heading.
- Include keyboard controls, visible focus states, and an `aria-live` map-status region.
- Keep geographic orientation left-to-right in Arabic while surrounding content follows RTL.

## Final CTA

After the map, add a restrained “Have a project in mind?” conversion panel using the existing Cal.com strategy-call button and configuration.

Do not change existing Cal.com metadata, locale picker, WhatsApp routing, footer links, or unrelated site sections.

## Flawless Page Switching

Preserve the multi-page static architecture.

- Enable same-origin cross-document View Transitions across all three pages.
- Give the shared header/logo stable transition names and use a short cross-fade/vertical content transition.
- Prefetch `welcome.html`, `about.html`, and `portfolio.html` after idle and on internal-link hover, focus, or touch.
- Keep the landing-page loader only for the first direct visit in a browser session.
- Mark internal navigation before leaving so returning to `welcome.html` internally never replays the bento loader.
- Unsupported browsers receive immediate prefetched navigation.
- Guard page-specific JavaScript initializers so `main.js` runs without errors on all pages.

## Localization and Interfaces

- Add every portfolio, filter, case-file, map, fallback, CTA, metadata, and accessibility string to all five languages.
- Add localized page title and meta description.
- Preserve canonical brand names across locales.
- Continue logical CSS properties for RTL.
- Dispatch `cambm:localechange` after locale changes so dynamic portfolio content updates immediately.
- Treat `portfolio.html#myra`, `portfolio.html#hijaz`, and equivalent hashes as public deep links.

## Responsive Behavior

- Desktop: asymmetric atlas, side-by-side map copy/map, and side preview.
- Tablet: simplified two-column atlas and full-width case files.
- Mobile: single-column cards, wrapped filter chips, compact Any/All control, stacked map and preview, and full-width galleries.
- Validate at 1440px, 1024px, 900px, 768px, 375px, and 320px with no horizontal overflow.

## Assumptions

- The first implementation uses placeholders and no hosted CMS.
- The JSON registry is the lightweight content backend and remains compatible with static hosting.
- Real project copy, outcomes, imagery, and verified locations will replace placeholders later.
- No third-party map SDK, framework, bundler, or runtime dependency is introduced.
- CSS/JS cache versions are bumped consistently in all three HTML pages.
- Existing working-tree changes are preserved.
