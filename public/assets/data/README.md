# Portfolio Content Registry

`portfolio-data.js` is the single source for portfolio cards, filters, case files, and map markers. It loads as a normal script, so the atlas also works on restrictive static hosts and when previewed directly from disk.

## Add a project

1. Add one entry to `projects` with a unique lowercase kebab-case `id`.
2. Add the project’s service, industry, market, location, map positions, and logo path.
3. Add the corresponding translation prefix and copy to all five language maps in `js/i18n.js`.
4. Add localized alt text through the shared portfolio image-label keys.
5. Run `node scripts/validate-portfolio.js` from the repository root.

## Brand artwork

The `logo` path drives the large artwork shown on each project card. If it is missing or unavailable, the card falls back to the brand’s initial. Existing `cover` and `gallery` fields are reserved for future case-study media and are not currently rendered.

## Map coordinates

- The map uses an equirectangular `0 0 1000 500` projection generated from Natural Earth 1:110m country boundaries.
- Country zooms use separate Natural Earth 1:10m Admin 0 and Admin 1 SVGs in `assets/maps/countries/` so coastlines and province boundaries remain precise.
- `countries.*.worldMarker` positions the cluster in that full SVG view.
- `countries.*.viewBox` defines the animated country zoom target.
- `location.countryPosition` uses the city's projected longitude and latitude so project markers stay on their real locations.

Projects without a valid location continue to appear in the atlas but are omitted from the map.
