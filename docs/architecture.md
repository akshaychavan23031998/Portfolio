# Architecture

Server Components render the content-heavy routes. Client boundaries are limited to theme/smooth-scroll providers, navigation/dialog state, filtering, carousel controls, and form validation. Typed data and site configuration remain framework-independent. Heavy media uses `next/image`; project routes are statically generated.
