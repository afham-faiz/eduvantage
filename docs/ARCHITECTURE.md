# Architecture

Eduvantage is a **contract-first, cross-platform modular monolith**.

```
Web / Native clients
        │
        ▼
generated API client  (packages/api-client)
        │
        ▼
NestJS /v1 API         (apps/api)
        │
        ▼
application/domain modules  (apps/api/src/modules/*)
        │
        ▼
PostgreSQL on Supabase  (supabase/migrations)
```

## Principles

- **Nest is the one authoritative API.** All normal business operations go
  through `apps/api`. Clients (`student-web`, `merchant-web`, `admin-web`,
  and later the Expo apps) never contain authoritative business rules — they
  call the API.
- **Nest authorizes, Postgres enforces.** Application-level authorization
  lives in Nest. Postgres Row-Level Security isolates rows/tenants, and
  constraints/transactions enforce hard invariants. Neither layer is trusted
  to do the other's job. Foundation 001 does not implement RLS/auth yet —
  only structures the repo so it can be added cleanly.
- **Supabase migrations are the only schema authority.** Every schema change
  is a file in `supabase/migrations/`. No ORM migration tool (Prisma,
  Kysely migrations, etc.) is introduced alongside it.
- **Contracts are platform-neutral.** `packages/contracts` holds shared
  types/schemas with no server-only or client-only code, so the same
  contract works for web, iOS, and Android.
- **The API client is generated, not hand-written.** `packages/api-client`
  is generated from the NestJS OpenAPI document (`pnpm generate:api`).
  Generated files are marked as generated and are never hand-edited.
- **Modular monolith, not microservices.** One deployable API, organized
  into modules under `apps/api/src/modules/`. Split it later if there's an
  actual reason to; don't pre-build for a scale we don't have yet.
- **Native-compatible from day one.** The API and contracts don't assume a
  browser. `apps/student-mobile` and `apps/merchant-mobile` exist as thin
  Expo scaffolds to prove that, even though web ships first.

## What Foundation 001 deliberately does not do

No product schema, no auth, no RLS policies, no business modules. Those
land with the first real domain, following the same pattern the `health`
module already demonstrates end-to-end (contract → Nest controller →
OpenAPI → generated client → web app).
