# Performance fixes

## Problems found

| Problem                                                                                          | Files affected                                        | Impact                                                                                    |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Lenis owned a permanent `requestAnimationFrame` loop while CSS smooth scrolling was also enabled | `src/components/providers.tsx`, `src/app/globals.css` | Duplicate scroll behavior, continuous main-thread work, and unnecessary client JavaScript |
| Project cards began at zero opacity and depended on animation initialization                     | `src/components/project-grid.tsx`                     | Cards could remain invisible in full-page capture and reduced-motion workflows            |
| Header used an expensive 18px backdrop blur                                                      | `src/app/globals.css`                                 | Repaint/compositing cost on a fixed full-width element                                    |
| Several packages had no runtime imports                                                          | `package.json`, `package-lock.json`                   | Larger install surface and maintenance/audit noise                                        |
| Testimonial movement had no reduced-motion, visibility, hover, or focus lifecycle                | `src/components/testimonials.tsx`                     | Distracting motion and unnecessary work while hidden                                      |
| Dense cards and undersized images reduced visual clarity                                         | `src/app/globals.css`                                 | More scanning effort and a visually compressed page                                       |

## Fixes applied

- Removed Lenis and its global animation-frame loop. Native scrolling is now the only scroll engine.
- Retained CSS anchor smoothing for normal motion and switches to `auto` under `prefers-reduced-motion`.
- Removed the project cards' hidden initial state; filtering still uses Motion layout/exit transitions.
- Reduced fixed-header backdrop blur from 18px to 11px.
- Removed unused `@studio-freight/lenis`, `gsap`, `clsx`, and `tailwind-merge` packages.
- Added a six-second Embla advance timer that is disabled for reduced motion, pauses on hover/focus, skips hidden tabs, and cleans up on unmount.
- Kept orbit and flow animation CSS-only, transform-based, and disabled effectively by the reduced-motion media query.
- Added fine-pointer-only project hover transforms, avoiding tilt/motion on touch hardware.

## Before/after reasoning

Before, every normal-motion visit started a JavaScript RAF loop solely for scroll interpolation while the browser also had smooth anchor scrolling. After, wheel, trackpad, touch, keyboard, Home/End, Page Up/Down, and anchors remain browser-native with no permanent JavaScript loop. The visual motion that remains is local, transform-based, input-aware, and reduced-motion safe.
