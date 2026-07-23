# Reference JavaScript behavior map

Post-migration status: the complete source runtime is generated into
`public/reference-runtime.js` and loaded only by the homepage. Every behavior in
the pre-implementation table below is migrated with its original selectors,
values, timings, and event behavior. A Next-specific ready-state guard preserves
the 1750ms boot sequence when the external runtime loads after the browser load
event.

Playwright verifies navigation, palette, theme, filtering, mobile menu, project
routes, responsive overflow, and console behavior. Nine-viewport screenshot
comparison reports 0.0499%–0.0768% changed pixels, primarily from independently
randomized star-canvas frames and animation timing.

Source script: reference lines 3052–3387. This map is created before migration.

| Original behavior/function | Original implementation                                        | React component/hook                             | Migrated status                                 | Verified status                |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- | ------------------------------ |
| DOM helpers `$`, `$$`      | `querySelector` wrappers                                       | Replaced by refs/component state where practical | Pending                                         | Pending                        |
| Boot sequence              | `load` + 1750ms adds `body.ready`                              | `BootScreen`                                     | Pending                                         | Pending                        |
| Theme initialization       | reads `localStorage["arc-theme"]`                              | theme provider/reference hook                    | Partial; different key/provider                 | Pending                        |
| `toggleTheme()`            | toggles `data-theme`, persists                                 | `Header`/theme hook                              | Partial                                         | Pending                        |
| Scroll progress            | scroll listener calculates percentage                          | `ScrollProgress`                                 | Pending                                         | Pending                        |
| Reveal observer            | IntersectionObserver threshold `.12`, adds `.in`, unobserves   | `useReferenceReveal`                             | Pending                                         | Pending                        |
| Metric counter             | IntersectionObserver threshold `.5`, 1400ms RAF                | `Metrics` hook                                   | Pending                                         | Pending                        |
| Cursor mouse tracking      | direct spotlight/dot pointer update                            | `ReferenceEffects`                               | Partial                                         | Pending                        |
| `cursorLoop()`             | ring lerp `.14`, one RAF                                       | `ReferenceEffects`                               | Partial; current coefficient differs            | Pending                        |
| Interactive cursor         | hover on `a,button,.project,.node`                             | delegated pointer hook                           | Partial                                         | Pending                        |
| Magnetic buttons           | pointer delta × `.12`                                          | `useMagnetic`                                    | Pending                                         | Pending                        |
| Project tilt               | perspective 900, rotateX 3°, rotateY 4°, desktop ≥980          | `ProjectCard` hook                               | Pending                                         | Pending                        |
| Project filtering          | `.filter.active`, `.project.hidden` by `data-cat`              | `ProjectGrid` state                              | Migrated behavior, DOM differs                  | Pending                        |
| Copy email                 | Clipboard API, 1500ms label, mailto failure                    | `CopyEmailButton`                                | Migrated with stronger fallback; timing differs | Pending                        |
| `openPal()` / `closePal()` | class toggle, 20ms focus, clears input/filter                  | `CommandPalette`                                 | Partial                                         | Pending                        |
| Palette keyboard           | Cmd/Ctrl+K toggle; Escape closes overlays                      | `CommandPalette`/global hook                     | Partial                                         | Pending                        |
| `E` shortcut               | copies exact email outside inputs                              | global keyboard hook                             | Pending                                         | Pending                        |
| Palette search             | text-content filter                                            | `CommandPalette` state                           | Migrated                                        | Pending                        |
| Palette commands           | hash navigation/theme action                                   | `CommandPalette`                                 | Migrated with different markup                  | Pending                        |
| Case-study modal           | `.case` opens; close/backdrop/Escape closes                    | `CaseStudyModal`                                 | Pending                                         | Pending                        |
| Heatmap generation         | append 286 `<i>` cells                                         | `EngineeringSignals` deterministic render        | Pending                                         | Pending                        |
| 404 overlay                | footer button/hash opens; close hides                          | `Reference404`                                   | Pending                                         | Pending                        |
| Active navigation          | section observer root margin `-45% 0 -50%`                     | `Header` active-nav hook                         | Pending                                         | Pending                        |
| Stars canvas `resize()`    | DPR canvas sizing, up to 70 points / width÷18                  | `ReferenceEffects`                               | Pending                                         | Pending                        |
| Stars canvas `draw()`      | upward speed `.08–.26`, radius `.3–1.3`, alpha `.3`, dim color | `ReferenceEffects`                               | Pending                                         | Pending                        |
| Testimonial `show()`       | translate track by index ×100%, sync dots                      | `Testimonials`                                   | Embla equivalent, not exact                     | Pending                        |
| Testimonial `restart()`    | 6500ms interval after controls                                 | `Testimonials`                                   | Current 6000ms                                  | Pending                        |
| Contact submit             | native validity, status-only EmailJS placeholder               | `ContactForm`                                    | React validation retained                       | Pending                        |
| Mobile `setOpen()`         | `nav.menu-open`, ARIA, body class                              | `Header`                                         | Equivalent under different class                | Pending                        |
| Mobile click               | prevent/stop, toggle                                           | `Header`                                         | Migrated                                        | Pending                        |
| Mobile link close          | closes on navigation                                           | `Header`                                         | Migrated                                        | Pending                        |
| Mobile outside click       | document click if outside nav                                  | `Header`                                         | Migrated                                        | Pending                        |
| Mobile Escape              | close and restore menu-button focus                            | `Header`                                         | Migrated                                        | Pending                        |
| Mobile resize              | close above 980px                                              | `Header`                                         | Current threshold differs                       | Pending                        |
| Visibility lifecycle       | not present in original                                        | cleanup enhancement only                         | Migrated                                        | Verified by unit source checks |
| Reduced motion             | canvas creation skipped; CSS disables motion                   | global effects                                   | Partial                                         | Pending                        |

## Verification requirements

- Exact timing/constants are copied from the source.
- Every listener, observer, timer, and RAF has React cleanup.
- Browser behavior is compared against the served reference at all required viewports.
- Accessibility safeguards may be retained only when they do not alter the reference presentation.
