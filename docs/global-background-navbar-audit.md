# Global background and navbar audit

## Current background sources

| Source                          | Current behavior                                                                   | Coverage/problem                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `body` in `src/app/globals.css` | Two 48px linear gradients create the visible square grid, plus one radial gradient | Applies globally, including homepage gaps, case studies, state pages, and footer surroundings              |
| `.hero` and its pseudo-elements | Adds a separate opaque graphite base, radial glows, star dots, and diagonal lines  | Hero-only atmosphere restarts at the hero boundary and duplicates a background that should be mounted once |
| `.loading-screen`               | Uses an opaque `var(--bg)` background                                              | Hides any root-level atmosphere                                                                            |
| `.footer`                       | Uses an opaque `var(--bg-2)` surface                                               | Creates a visual reset instead of allowing the atmosphere to continue                                      |
| Cards and component panels      | Use intentional panel backgrounds and borders                                      | These are useful surfaces, not competing page backgrounds, and should remain                               |

No reusable atmosphere component currently exists. The old square pattern is a CSS body background rather than a named “grid” component.

## Page coverage

- Homepage: global body grid plus a separate hero-only atmosphere.
- Project case studies: body grid only; they do not currently mount the homepage `PortfolioApp`, navbar, command palette, or custom cursor.
- Loading, error, and not-found states: inherit the body grid, with loading additionally hiding it behind an opaque screen.
- Contact and footer: contact uses a panel; the footer adds an opaque page-width reset.

## Cursor and spotlight

- `src/components/custom-cursor.tsx` mounts only through the homepage `PortfolioApp`.
- It owns one passive pointer listener and one RAF loop for the ring, stops when hidden, and uses no pointer-driven React state.
- It renders a dot and ring only. There is no large ambient spotlight.
- Case-study and state routes do not receive the cursor.

## Orbit and signal dots

- Three mint/blue dots are children of the homepage orbital rings.
- They are hero-local and rotate with the rings.
- No deterministic global signal-ball layer exists.

## Navbar mismatches

- Logo is `Akshay.` rather than `ARC.`.
- Navigation contains `Skills` and `Proof`, and lacks `Labs`.
- “Hire me ↗” is missing.
- The palette control includes a search icon alongside the shortcut rather than matching the compact reference control.
- Navbar mounts only on the homepage.
- The mobile menu lacks the Hire me action.
- Existing body scroll lock, Escape close, outside-click close, close-on-navigation, desktop-resize close, and ARIA state are present. Explicit focus containment/restoration is not yet implemented.

## Duplicate/global architecture issues

- Global UI is split between root layout and homepage-only `PortfolioApp`.
- Moving the navbar, command palette, cursor, spotlight, and atmosphere into one root-mounted shell will give every route consistent coverage and prevent duplicate listeners/layers.
- The hero’s local atmospheric pseudo-elements must be removed after the root atmosphere is added.

## Exact files planned for change

- `src/app/layout.tsx`: mount one global atmosphere and one global interactive chrome shell.
- `src/app/globals.css`: remove the body square grid, remove the hero-local atmosphere, add stable global layers, signal animations, spotlight styling, navbar parity, responsive and reduced-motion behavior.
- `src/components/layout/global-atmosphere.tsx`: deterministic stars, technical lines, and signal balls mounted once.
- `src/components/layout/global-chrome.tsx`: shared header, command palette, and cursor for every route.
- `src/components/custom-cursor.tsx`: add the spotlight to the existing single RAF/listener architecture.
- `src/components/header.tsx`: exact content, Hire me action, mobile menu coverage, focus containment/restoration.
- `src/components/portfolio-app.tsx`: remove homepage-only duplicate global chrome.
- `src/config/site.ts`: exact `ARC.` logo and About/Experience/Projects/Labs/Contact mapping.
- Global-UI unit/E2E tests and a dedicated Playwright screenshot script.

The reference HTML remains read-only and is not part of the change set.
