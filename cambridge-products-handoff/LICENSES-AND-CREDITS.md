# Licences and credits

## Cambridge-owned material

The source code, copy, product records, drawn marks and interface screenshots in this package belong
to the Cambridge group and were produced for cambt.com. They are provided for use on the Cambridge
Marketing website.

The interface screenshots show systems Cambridge offers. The originating vendors' names and logos
have been covered in every image, and the catalogue deliberately carries no third-party product
names. Do not restore or add them in copy, captions, file names or alt text.

## Third-party ideas adapted (MIT)

Two components adapt ideas from **React Bits** by David Haz, MIT licence
(https://github.com/DavidHDev/react-bits/blob/main/LICENSE). No React Bits source file was copied; the
code here was written for cambt.com. Keep this credit with the components if they are reused:

| Component | Idea taken from | What was written fresh |
| --- | --- | --- |
| `FittedField` | MagnetLines (https://reactbits.dev/animations/magnet-lines) | Grid geometry, token palette, resting state, and the per-frame work: centres derived from grid position (no layout reads), one coalesced animation frame, angles written to the DOM rather than state |
| `SystemWall` | drift-wall (https://reactbits.dev/components/drift-wall) for the drifting tiles, MagnetLines for the per-tile lift | Real links in a list, CSS 3D rather than WebGL, no timer and no pointer listener; the drift duration arrives by custom property so it can be stopped off screen |

`SystemMark`, its pulse, `AdaptationArgument`, `ScreenStack` and the page shell have no third-party
source.

## Fonts

- **Inter** by Rasmus Andersson, SIL Open Font License 1.1.
- **Instrument Serif** by Instrument, SIL Open Font License 1.1.

Both are available from Google Fonts. No font files are bundled in this package.

## Framework

The source targets Next.js 16 and React 19 (both MIT). The Breadcrumb component uses Tailwind CSS
utility classes (MIT); every other component uses CSS Modules.
