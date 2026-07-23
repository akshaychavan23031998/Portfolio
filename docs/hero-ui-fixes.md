# Hero UI fixes

## Problems found

- The global square grid showed through the hero and made the composition feel flat and repetitive.
- The technology strip used one text group and an arbitrary `-30%` endpoint, creating a visible reset.
- “Copy email” was a mail link and did not copy anything.
- Fine-pointer users had no reference-like cursor treatment.
- Interactive header and hero controls lacked a consistent restrained hover response.

## Files changed

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/portfolio-app.tsx`
- `src/components/custom-cursor.tsx`
- `src/components/copy-email-button.tsx`
- Hero-related unit and Playwright tests

## Performance decisions

- The atmospheric background is static CSS: two radial glows, sparse sub-pixel dots, and two faint technical lines. It uses no canvas, filter, timer, or animation.
- The marquee uses one transform-only CSS animation over two identical groups.
- Orbit motion remains transform-based CSS and respects the existing reduced-motion rule.
- The cursor is enabled only for fine pointers without reduced motion. Pointer events update refs directly, while one RAF loop interpolates only the ring. The loop stops on hidden documents and is cancelled on unmount.
- No React state is updated on pointer movement, and no GSAP or additional motion package is used.
