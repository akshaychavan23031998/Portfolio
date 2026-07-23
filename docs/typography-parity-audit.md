# Typography parity audit

Audit target: production build at `http://127.0.0.1:3000/` compared with the
immutable reference served at port 4173, at 1440 × 900.

## Root cause

The CSS family assignments and computed sizes already match the reference, but
neither page has a successfully loaded web-font face in the restricted browser.
The reference requests Google Fonts at runtime and that request fails with
`ERR_NETWORK_ACCESS_DENIED`. The Next.js page intentionally had no runtime font
request, so names such as `Manrope` and `Geist` resolved to browser fallbacks.
Declarations containing only `Manrope` therefore fell through to the browser's
initial serif family, producing the Times-like headings. `document.fonts`
contained zero registered faces.

`reference.css` loads correctly and is the sole homepage stylesheet. Legacy
`globals.css` is isolated to the project-route layout and does not override the
homepage. The problem is missing font resources, not stylesheet order, invalid
shorthand, or font synthesis.

| Element           | Reference font | Current computed font          | Expected weight | Current weight | Status                     |
| ----------------- | -------------- | ------------------------------ | --------------: | -------------: | -------------------------- |
| Body              | Geist          | `Geist, system-ui, sans-serif` |             400 |            400 | Family named; face missing |
| Nav brand         | Geist          | `Geist, system-ui, sans-serif` |             750 |            750 | Family named; face missing |
| Nav link          | Geist          | `Geist, system-ui, sans-serif` |             400 |            400 | Family named; face missing |
| Hero h1           | Manrope        | `Manrope, sans-serif`          |             800 |            800 | Family named; face missing |
| Role line         | Manrope        | `Manrope`                      |             600 |            600 | Serif fallback risk        |
| Hero paragraph    | Geist          | `Geist, system-ui, sans-serif` |             400 |            400 | Family named; face missing |
| Button            | Geist          | `Geist, system-ui, sans-serif` |             650 |            650 | Family named; face missing |
| Metric number     | Manrope        | `Manrope`                      |             750 |            750 | Serif fallback risk        |
| Section h2        | Manrope        | `Manrope, sans-serif`          |             800 |            800 | Family named; face missing |
| Eyebrow           | JetBrains Mono | `"JetBrains Mono", monospace`  |             500 |            500 | Family named; face missing |
| Capability h3     | Manrope        | `Manrope`                      |             700 |            700 | Serif fallback risk        |
| Pill              | JetBrains Mono | `"JetBrains Mono"`             |             400 |            400 | Serif fallback risk        |
| Job date          | JetBrains Mono | `"JetBrains Mono"`             |             400 |            400 | Serif fallback risk        |
| Job title         | Manrope        | `Manrope`                      |             700 |            700 | Serif fallback risk        |
| Project title     | Manrope        | `Manrope`                      |             750 |            750 | Serif fallback risk        |
| Project paragraph | Geist          | `Geist, system-ui, sans-serif` |             400 |            400 | Family named; face missing |
| Lab title         | Manrope        | `Manrope`                      |             700 |            700 | Serif fallback risk        |
| Testimonial quote | Manrope        | `Manrope`                      |             550 |            550 | Serif fallback risk        |
| Contact heading   | Manrope        | `Manrope`                      |             800 |            800 | Serif fallback risk        |
| Form input        | Geist          | `Geist`                        |             400 |            400 | Serif fallback risk        |
| Footer            | Geist          | `Geist, system-ui, sans-serif` |             400 |            400 | Family named; face missing |

The complete pre-change computed values, stylesheet list, console messages, font
faces, and failed requests are recorded in
`artifacts/typography-parity/typography-computed-styles-before.json`.

## Planned typography-only correction

1. Load Geist, Manrope, and JetBrains Mono through supported `next/font/google`
   imports with `display: swap`.
2. Expose the generated faces as root CSS variables.
3. Add `--font-body`, `--font-display`, and `--font-mono` tokens.
4. Replace family-only and unsafe fallback declarations with those tokens while
   preserving every size, weight, line height, and letter-spacing value.
5. Apply the same root variables to homepage, project routes, loading, errors,
   overlays, and mobile navigation.

## Post-change verification

- `next/font/google` now emits same-origin WOFF2 resources for all requested
  Geist, Manrope, and JetBrains Mono weights.
- The root element exposes `--font-geist`, `--font-manrope`, and
  `--font-jetbrains-mono`.
- All representative computed family chains begin with the intended loaded face.
- `document.fonts.check()` succeeds for all three families.
- Current production recorded no failed font requests and no console errors.
- No visible homepage element computes to Times New Roman or Georgia.
- Font size, weight, line height, and letter spacing remain unchanged from the
  reference audit values.
- The final computed-style record is
  `artifacts/typography-parity/typography-computed-styles.json`.
