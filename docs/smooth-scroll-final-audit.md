# Smooth-scroll final audit

Audit date: 24 July 2026

Protected reference:
`akshay-engineering-portfolio-final-responsive-fixed.html`

## Executive finding

The audited starting point did not contain Lenis or Locomotive Scroll. There was
no Lenis import, `new Lenis()` call, Lenis RAF loop, Lenis cleanup, or Lenis
dependency to repair. Scrolling used the browser's native engine with
`scroll-behavior: smooth` declared in both `src/app/globals.css` and
`src/app/reference.css`.

The homepage loads `public/reference-runtime.js`. That runtime has two
permanent animation-frame loops unrelated to a scroll engine:

1. A custom-cursor interpolation loop.
2. A full-viewport canvas star loop.

It also has transient metric-counter RAF callbacks, one unthrottled scroll
listener for the progress bar, mousemove handlers for magnetic elements and
project tilt, several fixed layers, and multiple backdrop filters. These can
affect perceived scroll smoothness even though native scrolling itself is not
being interpolated.

## Scroll implementation inventory

| Area                            | Finding                                 | Count / behavior                               |
| ------------------------------- | --------------------------------------- | ---------------------------------------------- |
| Lenis imports                   | None                                    | 0                                              |
| Lenis instances                 | None                                    | 0                                              |
| Lenis RAF loops                 | None                                    | 0                                              |
| Locomotive imports/instances    | None in runtime code                    | 0                                              |
| Scroll engines                  | Native browser scrolling only           | 1                                              |
| CSS smooth scrolling            | Present in two stylesheets              | Same native engine, duplicate declaration      |
| Permanent RAF loops on homepage | Cursor and canvas stars                 | 2                                              |
| Transient RAF work              | Metric counters                         | Runs once when metrics intersect               |
| Scroll listeners                | Progress-bar width update               | 1, currently unthrottled                       |
| Mouse/pointer listeners         | Cursor, magnetic controls, project tilt | Multiple, desktop interaction only in practice |
| Intersection observers          | Reveals, counters, active navigation    | 3                                              |
| GSAP/ScrollTrigger runtime      | None                                    | 0                                              |
| Motion scroll hooks             | None                                    | 0                                              |
| Locomotive references           | Project technology descriptions only    | Not executable                                 |

## Files inspected

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/reference.css`
- `src/components/providers.tsx`
- `src/components/portfolio-app.tsx`
- `src/components/header.tsx`
- `src/components/command-palette.tsx`
- `src/components/custom-cursor.tsx`
- `src/components/layout/global-chrome.tsx`
- `src/components/layout/global-atmosphere.tsx`
- `public/reference-runtime.js`
- `package.json`
- unit and E2E tests

## Detailed findings

### Initialization and Strict Mode

There is no Lenis initialization in render or in an effect, so React Strict
Mode cannot currently create duplicate Lenis instances. The existing unit test
explicitly asserts that native scrolling is the only engine.

### RAF lifecycle

The homepage cursor loop and canvas-star loop run continuously. The cursor loop
does not pause when the document is hidden, does not check pointer capability or
reduced motion, and has no cleanup because the reference runtime is loaded as a
page script. The canvas loop is disabled for reduced motion but does not pause
when hidden, caps particle count but not device pixel ratio, and has no cleanup.

Project routes use the React `CustomCursor`, whose single RAF loop is paused on
visibility changes and cancelled during effect cleanup.

### Scroll listener

The homepage progress listener reads `scrollHeight`, `innerHeight`, and
`scrollY`, then writes an inline width on every scroll event. It is not passive
or coalesced into an animation frame. This is a more plausible source of
scroll-time main-thread work than an absent Lenis instance.

### CSS and anchors

Native smooth scrolling is declared in both global stylesheets. Reduced-motion
media rules switch it to `auto`. Navbar and CTA anchors are ordinary hash links,
while command-palette navigation explicitly calls `scrollIntoView` with smooth
behavior. `scroll-padding-top: 90px` provides the fixed-navbar offset.

### Visual workload

The homepage combines fixed cursor/spotlight elements, a full-viewport canvas,
continuous CSS orbit/marquee/packet animations, multiple backdrop filters, and
mousemove transforms. These effects are part of the protected visual behavior
and will not be removed. Scheduling and lifecycle can be optimized without
changing their appearance.

## Production measurements and decision

The deployed build confirmed that there was no Lenis instance. During a
controlled desktop wheel pass, frame intervals averaged approximately 23.6 ms,
with a 50 ms p95, 35 frames above 25 ms, and two long tasks (92 ms and 361 ms).

A minimal direct Lenis 1.3.23 integration was then tested against the same local
production build. It initialized once, cleaned up correctly, used native
scrolling on touch/reduced motion, and preserved anchors, but failed the
performance decision gate. At 1440 × 900, the direct Lenis path measured
approximately 44.3 ms average / 83.3 ms p95 versus the same build's native
fallback at approximately 37.8 ms / 66.6 ms. Lenis added a continuous
application RAF without resolving the page's rendering workload.

Following the requested decision gate, direct Lenis code and the direct
dependency were removed. Locomotive Scroll 5.0.1 was installed and tested. It
owns its internal ticker, so the application does not add a second scroll RAF.
The same constrained headless comparison measured approximately 39.7 ms average
for Locomotive versus 40.1 ms for native, with no console errors. This does not
eliminate the page's visual rendering cost, but it satisfies the single managed
scroll-instance requirement without an application-owned duplicate RAF.

## Final implementation

- One dynamically imported Locomotive Scroll 5.0.1 instance.
- Initialized inside a client `useEffect` only for fine-pointer, hover-capable
  devices.
- Native scrolling on touch/coarse-pointer devices.
- Native scrolling under `prefers-reduced-motion: reduce`.
- Instance stored in a ref and destroyed during cleanup.
- Strict Mode's disposed asynchronous initialization cannot create a duplicate
  instance.
- Locomotive is stopped while the document is hidden and restarted when visible.
- CSS native smooth scrolling was removed to prevent double smoothing.
- Hash navigation uses one shared event and Locomotive `scrollTo` with the
  existing 90 px navbar offset.
- The homepage progress listener is passive and coalesced to one animation
  frame.
- The homepage cursor RAF now runs on demand and stops after interpolation
  settles.
- The star RAF pauses while the document is hidden.

Locomotive Scroll 5 is itself built on Lenis internally, so `lenis` remains only
as Locomotive's transitive package dependency. There is no direct Lenis
dependency, import, instance, or application RAF loop.

## Final validation

| Check                    | Result                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Formatting               | Passed                                                                                   |
| ESLint                   | Passed                                                                                   |
| TypeScript               | Passed                                                                                   |
| Unit tests               | 8 files, 22 tests passed                                                                 |
| Production build         | Passed; 17 static/SSG pages generated                                                    |
| E2E                      | 22 passed, 2 device-inapplicable tests skipped                                           |
| Desktop engine           | Locomotive at 1440 × 900, 1280 × 720, and 768 × 1024                                     |
| Mobile engine            | Native at 390 × 844 and 320 × 568                                                        |
| Reduced motion           | Native                                                                                   |
| Horizontal overflow      | 0 px at every required viewport                                                          |
| Console/hydration errors | None observed                                                                            |
| npm audit                | 3 existing high advisories inherited through Next.js; no safe non-breaking automatic fix |

## Protected scope

No UI, layout, typography, color, content, route, form, EmailJS behavior,
metadata, asset, or reference HTML change is authorized by this audit.
