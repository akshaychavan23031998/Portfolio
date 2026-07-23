# Akshay Ram Chavan — engineering portfolio

A production-oriented Next.js portfolio based on the supplied engineering reference. Its graphite interface, mint/blue signals, capability map, request-to-production flow, real project media, and evidence-led copy communicate product ownership rather than a generic résumé.

## Stack and local development

Node 20+ is recommended. Run `npm install`, copy `.env.example` to `.env.local` only when configuring a provider, then run `npm run dev`. Production uses `npm run build` followed by `npm run start`.

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, and `test:e2e`.

## Structure and content

- `src/app`: routes, metadata, manifest, robots, sitemap, error states
- `src/components`: navigation, command palette, projects, carousel, form, providers
- `src/config/site.ts`: identity, navigation, contact and social links
- `src/data`: projects, skills, experience, testimonials
- `public/images`: profile, nine project screenshots, four testimonial portraits
- `public/resume`: downloadable résumé
- `tests`: Vitest components and Playwright flows
- `docs`: engineering and maintenance notes

Edit centralized data to change copy. Add a typed record to `src/data/projects.ts`, place its real image under `public/images/projects`, and ensure its slug is unique. Replace images without changing their stable paths, or update the corresponding data. Replace the résumé at `public/resume/akshay-ram-chavan-resume.pdf`.

## Contact and deployment

The form validates locally with React Hook Form and Zod, includes a honeypot and timing gate, and truthfully reports that no mail provider is configured. Follow `docs/email-integration.md` to add a server-side provider.

For Vercel, import the repository, keep the Next.js preset, add server-only environment variables, and deploy. Replace the placeholder domain in `src/config/site.ts` before launch, then confirm canonical, sitemap, and robots URLs.

## Quality

Run `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`. Install browsers once with `npx playwright install chromium`, start the production build, then run `npm run test:e2e`. Responsive CSS removes sticky profile behavior on tablet/mobile, keeps 44px controls, respects reduced motion, and avoids horizontal overflow.
