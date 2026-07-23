# Final pre-push repository audit

Status: inventory, cleanup, secret scan, validation, and production preview complete.

Protected reference SHA-256:
`E762CF325491DB987B57BDF57A338525498CE1D25C2F18F73FC1658C379EC27B`

## Inventory summary

| Path            |                 Files | Approximate size | Inventory note                                                             |
| --------------- | --------------------: | ---------------: | -------------------------------------------------------------------------- |
| `.git/`         |                    33 |          10.6 MB | Local Git metadata; never committed as content                             |
| `.next/`        |                 1,494 |         365.5 MB | Generated Next.js build/cache output                                       |
| `artifacts/`    |                   125 |          84.5 MB | Generated screenshots, diffs, and audit output                             |
| `docs/`         | 16 before this report |            62 KB | Intentional project documentation                                          |
| `node_modules/` |                30,345 |         562.1 MB | Installed dependencies                                                     |
| `public/`       |                    18 |           9.3 MB | Required runtime assets                                                    |
| `scripts/`      |                    15 |            30 KB | Intentional audit, screenshot, extraction, and image-maintenance utilities |
| `src/`          |                    31 |           133 KB | Production application source                                              |
| `test-results/` |                     1 |             45 B | Generated Playwright output                                                |
| `tests/`        |                     9 |            31 KB | Unit and E2E test source                                                   |

## File safety classification

Every repository path is covered below either explicitly or by a recursive path rule.

| Path                                                                       | Category                       | Required in Git   | Safe to delete                                 | Should be ignored | Reason                                                                         |
| -------------------------------------------------------------------------- | ------------------------------ | ----------------- | ---------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `src/**`                                                                   | A. Production source           | Yes               | No                                             | No                | Next.js application source, data, components, routes, and styles               |
| `public/**`                                                                | C. Public asset                | Yes               | No                                             | No                | Runtime images, résumé, and reference runtime                                  |
| `tests/**`                                                                 | D. Test source                 | Yes               | No                                             | No                | Unit and Playwright coverage                                                   |
| `docs/**`                                                                  | E. Documentation               | Yes               | No                                             | No                | Architecture, accessibility, deployment, audit, and maintenance records        |
| `scripts/**`                                                               | E. Documentation / maintenance | Yes               | No                                             | No                | Intentional visual validation, extraction, audit, and image-processing scripts |
| `package.json`                                                             | B. Required configuration      | Yes               | No                                             | No                | Dependency and script manifest                                                 |
| `package-lock.json`                                                        | B. Required configuration      | Yes               | No                                             | No                | Reproducible dependency lock                                                   |
| `tsconfig.json`                                                            | B. Required configuration      | Yes               | No                                             | No                | TypeScript configuration                                                       |
| `next-env.d.ts`                                                            | B. Required configuration      | Yes               | No                                             | No                | Next.js TypeScript declarations                                                |
| `eslint.config.mjs`                                                        | B. Required configuration      | Yes               | No                                             | No                | Lint configuration                                                             |
| `postcss.config.mjs`                                                       | B. Required configuration      | Yes               | No                                             | No                | CSS build configuration                                                        |
| `playwright.config.ts`                                                     | B. Required configuration      | Yes               | No                                             | No                | Browser-test configuration                                                     |
| `vitest.config.ts`                                                         | B. Required configuration      | Yes               | No                                             | No                | Unit-test configuration                                                        |
| `.prettierrc`                                                              | B. Required configuration      | Yes               | No                                             | No                | Formatting configuration                                                       |
| `.prettierignore`                                                          | B. Required configuration      | Yes               | No                                             | No                | Protects generated content and the immutable reference from formatting         |
| `.gitignore`                                                               | B. Required configuration      | Yes               | No                                             | No                | Repository safety rules                                                        |
| `.env.example`                                                             | B. Required configuration      | Yes               | No                                             | No                | Empty deployment-variable template                                             |
| `README.md`                                                                | E. Documentation               | Yes               | No                                             | No                | Project setup and maintenance documentation                                    |
| `akshay-engineering-portfolio-final-responsive-fixed.html`                 | G. Reference source of truth   | Yes               | No                                             | No                | Immutable reference required by runtime/tests                                  |
| `.env.local`                                                               | J. Secret/configuration file   | No                | No                                             | Yes               | Local EmailJS configuration; must never be committed                           |
| `.env`, `.env.*.local`, `.env.production`, `.env.development`, `.env.test` | J. Secret/configuration file   | No                | Only when local copies exist and are backed up | Yes               | Environment-specific configuration                                             |
| `.next/**`, `out/**`, `build/**`, `dist/**`                                | H. Generated output            | No                | Yes                                            | Yes               | Recreated by build commands                                                    |
| `node_modules/**`                                                          | H. Generated output            | No                | Yes                                            | Yes               | Recreated from the lockfile                                                    |
| `coverage/**`, `test-results/**`, `playwright-report/**`, `blob-report/**` | H. Generated output            | No                | Yes                                            | Yes               | Recreated by test tooling                                                      |
| `artifacts/**`                                                             | H. Generated output            | No                | Yes                                            | Yes               | Recreated by intentional screenshot/audit scripts                              |
| `debug.log`, `*.log`, package-manager debug logs                           | K. Debug file                  | No                | Yes                                            | Yes               | Local diagnostic output                                                        |
| `tsconfig.tsbuildinfo`, `*.tsbuildinfo`                                    | H. Generated output            | No                | Yes                                            | Yes               | Recreated by TypeScript                                                        |
| `.vercel/**`                                                               | I. Local-only file             | No                | Yes                                            | Yes               | Local Vercel project linkage                                                   |
| `.DS_Store`, `Thumbs.db`, `desktop.ini`                                    | I. Local-only file             | No                | Yes                                            | Yes               | OS metadata                                                                    |
| `.idea/**`                                                                 | I. Local-only file             | No                | Yes                                            | Yes               | User-local IDE metadata                                                        |
| `.vscode/**`                                                               | L. Uncertain                   | Review if present | No until reviewed                              | Conditional       | Keep shared recommendations/settings; ignore user-local state                  |
| `.agents/`                                                                 | L. Uncertain                   | No current files  | No                                             | Conditional       | Empty local agent directory; retain until cleanup review                       |
| `.git/**`                                                                  | I. Local-only file             | No                | No                                             | Git-managed       | Repository metadata, not project content                                       |

## Root-file decisions

| Path                                                               | Decision                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `.env.example`, `.gitignore`, `.prettierignore`, `.prettierrc`     | Commit                                                                        |
| `README.md`, all documented configs, package manifest and lockfile | Commit                                                                        |
| Protected reference HTML                                           | Commit unchanged                                                              |
| `.env.local`                                                       | Retain locally; ignore                                                        |
| `debug.log`, `tsconfig.tsbuildinfo`                                | Delete after ignore rules are verified                                        |
| `.next/`, `artifacts/`, `node_modules/`, `test-results/`           | Delete as reproducible generated/local output after ignore rules are verified |

## Public asset decisions

All 18 files under `public/` are retained. This includes nine project images, four testimonial images, the original and derived profile images, the reference portrait, the résumé PDF, and `reference-runtime.js`. Potentially redundant profile sources are retained because they are useful source assets and are not unquestionably safe to delete.

## Script decisions

All 15 scripts are intentional and retained. They support typography auditing, visual parity, asset validation, experience/contact/theme screenshot capture, reference extraction, static reference serving, and reproducible profile-image processing. None is classified as an unreferenced accidental temporary file.

## Cleanup performed

The following reproducible or local-only outputs were removed after their paths were resolved inside the workspace and their classifications were verified:

- `.next/`
- `artifacts/`
- `node_modules/` (reinstalled from `package-lock.json` for validation, then removed again)
- `test-results/`
- `debug.log`
- `tsconfig.tsbuildinfo`

The empty, tool-managed `.agents/` directory was retained and ignored. No source, public asset, test, script, documentation, configuration, environment file, or protected reference file was deleted.

## Validation summary

| Check                   | Result                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Format                  | Passed                                                                                                                   |
| Format check            | Passed                                                                                                                   |
| ESLint                  | Passed                                                                                                                   |
| TypeScript              | Passed                                                                                                                   |
| Unit tests              | 18 passed                                                                                                                |
| Production build        | Passed; 17 static/SSG pages generated                                                                                    |
| E2E                     | 20 passed, 2 device-inapplicable tests skipped                                                                           |
| Production HTTP preview | Homepage, all nine project routes, metadata routes, résumé, representative assets, and 404 behavior passed               |
| Secret scan             | No configured value found outside `.env.local`                                                                           |
| npm audit               | Three high advisories inherited through the current Next.js dependency tree; no safe non-major automatic fix was offered |

The E2E suite initially had one mobile focus assertion fail only when run with two workers. The same behavior passed in its dedicated coverage and the complete suite passed serially. No application or test code was changed.

## Manual-review items

- `src/config/site.ts` intentionally retains the existing `https://example.com` deployment URL because metadata changes were outside this audit's authorization. Replace it with the final Vercel production origin before considering deployment metadata final.
- Review the three upstream npm advisories when a compatible Next.js dependency update becomes available. `npm audit fix --force` and npm's proposed major downgrade were not applied.
