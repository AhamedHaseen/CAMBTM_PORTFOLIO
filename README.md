# Cambridge Marketing — Website

A superside.com-style marketing site for Cambridge Marketing (CAMBM), rebuilt as a proper
multi-file project instead of one giant HTML file.

## Project structure

```
cambm-website/
├── index.html              Page markup only — no inline CSS/JS
├── server.js               Tiny local dev server (Node, no dependencies)
├── start-server.bat        Double-click to launch (Windows, shows a console window)
├── start-server-silent.vbs Double-click to launch in the background (no window)
├── css/
│   ├── main.css            Core design system: colors, layout, components
│   └── animations.css      Scroll-reveal, marquee, hover, noise-texture animations
├── js/
│   └── main.js             All interactivity: scroll reveals, counters, cursor, etc.
├── images/                 Logo + all 30 post images
└── assets/                 Reserved for future fonts/icons/etc.
```

## Running it locally

**Requires:** [Node.js](https://nodejs.org) (LTS) — one-time install, just click through.

1. Double-click `start-server.bat` (a console window opens and stays open — this is normal,
   it's showing the server log).
2. Open `http://localhost:8080/` in your browser.
3. To stop, close the console window or press `Ctrl+C` in it.

Prefer no visible window? Use `start-server-silent.vbs` instead — same result, runs quietly
in the background. To stop it, end the `node.exe` process in Task Manager.

## Editing

- **Change text/structure/layout of sections** → `index.html`
- **Change colors, spacing, fonts, component styling** → `css/main.css`
- **Change how animations behave** → `css/animations.css`
- **Change scroll effects, counters, cursor behavior, etc.** → `js/main.js`
- **Swap or add images** → drop files in `images/`, then reference them in `index.html`
  as `images/your-file.png`

## Current status

- Branding is already Cambridge Marketing / CAMBM throughout.
- Hero scrolling gallery uses your real post images (`post-1` through `post-6`, `Post-3-big`).
- Services and Work Showcase sections still use placeholder Unsplash stock photos.
- Nav items "Why us," "Resources," "Pricing," and all footer links are placeholders (`#`) —
  not wired to real pages/sections yet.
- 24 of your 30 post images aren't used anywhere yet — good material for the Work
  Showcase section.

## Design reference

See `superside-clone-README.md` (kept from the original handoff) for the full breakdown of
what was copied from superside.com: color tokens, typography scale, spacing system, and a
list of every animation and where it's used.
