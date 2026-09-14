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

## Database access

`apps/api/src/database/` is the only place that talks to Postgres:

- **`DatabaseService`** _is_ a `Kysely<Database>` instance (it extends
  `Kysely`), built from `DATABASE_URL` via a direct `pg` connection —
  not Supabase's PostgREST/Data API, not the Supabase JS client. It fails
  fast (throws at startup) if `DATABASE_URL` is missing.
- **`DatabaseModule`** is `@Global()` and provides `DatabaseService` once
  for the whole API; feature modules inject it straight into their
  repository, no per-module wiring.
- **`database.types.ts`** is a hand-written Kysely schema mirroring
  `supabase/migrations/` exactly (snake_case, matching the DB). There is
  no schema-introspection codegen yet — keep it in sync by hand when a
  migration changes a table shape.
- Kysely, not an ORM: no entity classes, no implicit relations, no ORM
  migrations. Every query is explicit SQL built through a typed query
  builder. `supabase/migrations/` remains the only schema authority.

Module layout for a domain (see `apps/api/src/modules/deals/` as the
reference): **controller** (HTTP only) → **service** (use-case logic,
shapes rows into the API contract, throws the right exceptions) →
**repository** (Kysely queries only, no business rules beyond a shared
definition of "active"). Don't collapse these into one file.

## Security model: Nest's database connection and RLS

- `DATABASE_URL` is a **direct PostgreSQL connection** (in local dev, the
  `postgres` superuser Supabase's CLI provisions) — not Supabase's
  service-role JWT, not the Data API in any form. It is a privileged,
  server-only secret: it must never reach a browser or mobile bundle, and
  it isn't — only `apps/api` ever reads `DATABASE_URL`.
- Whether that connection bypasses Row-Level Security depends on the
  Postgres role behind it — a table owner or superuser (the local default)
  does; a role created specifically without `BYPASSRLS` would not. Treat it
  as bypassing RLS unless you've confirmed otherwise for a given
  environment. **RLS is therefore not what protects data from Nest's own
  queries** — every repository query must apply its own explicit filters
  (e.g. `deals.is_active = true`). RLS here is a defense-in-depth boundary
  for any _other_ access path: a future direct Supabase client, the
  PostgREST Data API, a dashboard tool connecting with a lower-privileged
  role, etc.
- Current RLS baseline (see the Foundation 002 migration): `institutions`,
  `merchants`, `merchant_locations`, `deals`, and `deal_institutions` all
  have RLS enabled with a single `select` policy each, open to `anon` and
  `authenticated`. Visibility requires the row itself to be active, its
  parent to be active where one exists (locations/deals require an active
  merchant), and — for deals and their institution links specifically —
  the current time to fall inside `starts_at`/`ends_at` (see
  `is_deal_publicly_visible()` in the migration, the single place that
  rule is defined so the `deals` and `deal_institutions` policies can't
  drift apart). No `insert`/`update`/`delete` policies exist for those
  roles — RLS defaults to deny, so anonymous/authenticated writes are
  rejected outright. There are no authenticated-user-scoped policies yet
  because there is no auth flow yet; don't invent one speculatively.

### Verification-ready model (deferred, on purpose)

Foundation 002 does **not** create `student_profiles` or
`student_verifications` tables. Creating them now would force a decision
this repo hasn't made yet — what auth provider issues the user id these
tables would foreign-key to (Supabase Auth's `auth.users`, or something
else) — and the brief for this milestone explicitly excludes auth. Adding
speculative schema ahead of that decision risks getting the shape wrong.

When that work starts (tracked as a later foundation), the clean path is:

1. Decide the auth provider first (most likely Supabase Auth, given the
   rest of the stack).
2. Add `student_profiles` with `id uuid primary key references auth.users
(id) on delete cascade` plus whatever profile fields are needed, and
   `student_verifications` (status, method, reviewed_by, timestamps)
   referencing it.
3. RLS on both: authenticated users read/write only their own row
   (`using (auth.uid() = id)` or equivalent), consistent with the
   anon-read/privileged-write pattern already established here.
4. No existing table in this migration needs to change shape to support
   that — `deal_institutions` already models eligibility independently of
   individual students.

## Deals module (first real domain)

`GET /v1/deals` and `GET /v1/deals/:slug` — both return only deals that
are active, whose merchant is active, and that are within their
`starts_at`/`ends_at` window (a null bound means unbounded on that side).
`?featured=true` narrows to featured deals; `?institution=<slug>` returns
deals with no institution targeting (open to everyone) plus deals that
explicitly target that institution — see `deal_institutions`' table
comment in the migration for the exact semantics. The response is
camelCase and nests merchant summary info; nothing DB-shaped leaks
through (see `apps/api/src/modules/deals/deals.service.ts`'s row→contract
mapping).

## What's still deliberately absent

Auth, RLS policies scoped to an authenticated user, QR/redemption,
payments, merchant/admin dashboards, and anything from
`docs/PRODUCT.md`'s merchant/admin sections. Those land with their own
foundations, following the same contract → Nest module → OpenAPI →
generated client → web app pattern the `health` and `deals` modules both
demonstrate end-to-end.
