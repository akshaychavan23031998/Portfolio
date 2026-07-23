# Secret scan report

Date: 2026-07-24

## Result

No configured EmailJS value or other credential was found outside `.env.local`.

The scan covered production source, public files, tests, scripts, documentation, root configuration, generated artifacts, and debug output while excluding dependency/build internals. The configured EmailJS values were searched directly, but are intentionally not reproduced in this report.

## Environment files

| Path                | Result                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `.env.local`        | Exists locally, contains three configuration entries, and is ignored by Git |
| `.env.example`      | Contains exactly three empty `NEXT_PUBLIC_EMAILJS_*` placeholders           |
| Other `.env*` files | None found                                                                  |

## Expected non-secret references

The following environment-variable names are intentionally referenced by the EmailJS bridge and its mocked unit tests:

- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

Tests use dummy values only. No real EmailJS value appears in source, tests, documentation, README content, scripts, public assets, generated screenshots, or logs.

## Additional credential scan

Repository text was reviewed for API keys, private keys, tokens, passwords, SMTP credentials, OAuth secrets, authorization headers, bearer tokens, Google credentials, Vercel tokens, and GitHub tokens. No actionable credential exposure was found.

## Git safety

`.gitignore` already excludes `.env.local`; the final ignore audit will retain that protection and add explicit environment variants. `.env.example` remains unignored and safe to commit.
