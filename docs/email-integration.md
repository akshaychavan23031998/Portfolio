# Email integration

The current form performs honest local validation only. Add a server action that re-validates the same Zod schema, repeats spam checks, and calls Resend (or EmailJS only if its public-client security model is acceptable). Store secrets in server-only environment variables, return a typed result, rate-limit by a privacy-conscious identifier, and never claim delivery before the provider confirms it.
