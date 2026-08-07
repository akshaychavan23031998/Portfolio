# Project modal scroll safety audit

Audit date: 7 August 2026

## Scope

This audit covers only the shared project case-study modal, its interaction with the existing Locomotive Scroll provider, background scroll locking, and modal scrollbar visibility. The reference HTML is read-only and retains SHA-256 `E762CF325491DB987B57BDF57A338525498CE1D25C2F18F73FC1658C379EC27B`.

| Area                       | Current implementation                                                                                      | Finding                                                                                                                | Planned minimal fix                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Modal scroll owner         | `.modal.project-case-study` has `max-height: 88vh` and `overflow: auto`                                     | The whole dialog, including its sticky header, is the scroll owner. There is no dedicated, focusable content scroller. | Keep the dialog shell and make one child `.case-study-scroll` the sole bounded vertical scroll area.                                           |
| Background lock            | The modal sets only `document.body.style.overflow = "hidden"`                                               | This does not preserve/freeze the native window position reliably and does not stop Locomotive's wheel processing.     | Capture `scrollY`, freeze the body at that position, lock the root overflow, and restore all inline styles and the exact position on cleanup.  |
| Locomotive integration     | One Locomotive 5.0.1 instance is owned by `SmoothScrollProvider`; it remains active while the modal is open | Global wheel input can still be consumed by the background engine.                                                     | Use a scoped custom lifecycle event so the existing instance calls its verified `stop()`/`start()` API. Do not create or recreate an instance. |
| Wheel/trackpad containment | No modal input-containment handler                                                                          | Events can bubble to the document-level smooth-scroll listener.                                                        | Stop propagation at the overlay/dialog boundary while Locomotive is paused; use CSS overscroll containment on the true scroller.               |
| Touch containment          | No modal-specific `touch-action`; only generic overscroll containment on the dialog                         | Native touch can leak at scroll boundaries.                                                                            | Apply `touch-action: pan-y` and `overscroll-behavior: contain` to the content scroller.                                                        |
| Keyboard scrolling         | Focus starts on the close button and the dialog owns overflow                                               | Page/arrow/Home/End keys are not explicitly routed to the content scroller.                                            | Keep focus behavior and route scrolling keys within the dialog to the dedicated scroller.                                                      |
| Scrollbar visibility       | The modal inherits the browser's normal scrollbar                                                           | The thumb is always visible; the main-document hidden-scrollbar CSS intentionally does not target nested scrollers.    | Add modal-only transparent idle thumb styling and an active class cleared by one 750 ms timer.                                                 |
| Lifecycle cleanup          | Key listener and body overflow are restored                                                                 | No scroll timer exists; root/body position styles and Locomotive state are not managed.                                | Clear the one timer/listeners, restore styles, resume/update the existing engine, restore focus, and reset modal scrollTop on each open.       |

## Installed API verification

The installed dependency is `locomotive-scroll@5.0.1`. Its bundled implementation exposes public `stop()`, `start()`, `resize()`, `scrollTo()`, and `destroy()` methods. `stop()` pauses the existing Lenis-backed RAF and input processing; `start()` resumes the same instance. These methods are already used by the provider for document visibility and are safe to reuse for the modal lifecycle.

## Safety boundaries

- No project data, content, links, filters, routes, theme, EmailJS, or reference HTML changes are required.
- The existing single Locomotive instance remains the only desktop scroll engine.
- Native mobile and reduced-motion scrolling remain the provider fallback outside the modal.
- Main-page scrollbar rules remain untouched; new scrollbar rules will target only `.case-study-scroll`.
