# Eduvantage

A Maldives-wide student discount platform and digital student
verification/redemption system. See `docs/PRODUCT.md` for the product
overview and `docs/ARCHITECTURE.md` for the technical one.

This repository is **Foundation 001**: the shared engineering scaffold
(monorepo, API skeleton, placeholder apps, Supabase wiring, CI). No product
features are implemented yet.

## Repository layout

```
apps/
  api/              NestJS API — the one authoritative backend (/v1)
  student-web/      Next.js — student-facing web app (placeholder)
  merchant-web/     Next.js — merchant-facing web app (placeholder)
  admin-web/        Next.js — internal admin web app (placeholder)
  student-mobile/   Expo — student app scaffold (not a launch blocker)
  merchant-mobile/  Expo — merchant app scaffold (not a launch blocker)

packages/
  contracts/        Shared, platform-neutral types/schemas (zod)
  api-client/       TypeScript client generated from the API's OpenAPI doc
  design-tokens/    Placeholder design tokens (Ailam owns the real system)
  ui-web/           Minimal shared web UI (proves workspace imports only)
  config/           Shared tsconfig/eslint base config
  testing/          Shared test config/utilities (grows as needed)

supabase/
  migrations/       The only schema authority — see docs/ARCHITECTURE.md
  seed/             Local dev seed data
  tests/            pgTAP database tests

docs/               ARCHITECTURE.md, PRODUCT.md
```

## Architecture, in one line

`Web/Native clients → generated API client → NestJS /v1 API → domain
modules → PostgreSQL on Supabase.` Full detail in `docs/ARCHITECTURE.md`.

## Prerequisites

- Node.js 24 LTS (see `.nvmrc`)
- [pnpm](https://pnpm.io) 9+ (`corepack enable` will pick up the version
  pinned in `package.json`)
- [Docker](https://docs.docker.com/get-docker/) — required to run Supabase
  locally
- [Supabase CLI](https://supabase.com/docs/guides/cli) — invoked via `npx
supabase`, no global install required

## Install

```bash
pnpm install
```

## Local development

Most day-to-day work only needs the API plus **one** web app running, not
the whole fleet. Two terminals is the normal setup:

```bash
# Terminal 1 — API (http://localhost:3001/v1, docs at /docs)
pnpm --filter @eduvantage/api dev

# Terminal 2 — the web app you're working on
pnpm --filter @eduvantage/student-web dev     # http://localhost:3000
pnpm --filter @eduvantage/merchant-web dev    # http://localhost:3002
pnpm --filter @eduvantage/admin-web dev       # http://localhost:3003
```

Copy each app's `.env.example` to `.env` / `.env.local` before running it.

Running everything at once (`pnpm dev`, via Turborepo) works too, but isn't
the recommended default — it's noisier and you're usually only touching one
app at a time.

### Mobile (Expo)

```bash
pnpm --filter @eduvantage/student-mobile dev
pnpm --filter @eduvantage/merchant-mobile dev
```

Opens the Expo dev tools; scan the QR code with Expo Go, or press `w` for
the web preview. These are placeholder scaffolds — not part of the web-first
launch.

## Supabase (local)

```bash
npx supabase start   # starts local Postgres + Studio (needs Docker running)
npx supabase stop
npx supabase db reset   # re-applies supabase/migrations/ + supabase/seed/
```

Studio runs at http://localhost:54323 once started. Local Postgres
connection details are printed by `supabase start` and match
`apps/api/.env.example`.

## Root commands (via Turborepo)

```bash
pnpm dev            # run all apps' dev servers (see note above)
pnpm build           # build every app/package
pnpm lint            # lint every app/package
pnpm typecheck        # typecheck every app/package
pnpm test             # run every package's tests
pnpm format           # format the repo with Prettier
pnpm format:check     # check formatting without writing
pnpm generate:api     # regenerate packages/api-client from apps/api's OpenAPI doc
```

Any of these can be scoped to one package: `pnpm --filter @eduvantage/api
test`.

## API client generation

`packages/api-client` is generated, not hand-written:

```
apps/api (NestJS + @nestjs/swagger)
        │  SwaggerModule.createDocument()
        ▼
apps/api/openapi.json   (gitignored — regenerate anytime)
        │  openapi-typescript
        ▼
packages/api-client/src/generated/schema.d.ts
```

Run `pnpm generate:api` after changing any controller, DTO, or route in
`apps/api`. Never hand-edit anything under `src/generated/` — it's
overwritten on every run.

## Tests

`pnpm test` runs each package's own suite (Jest for the Nest API, Vitest
for the plain TypeScript packages). Foundation 001 only has a handful of
tests (health endpoint, contract schema) — real coverage grows with real
domains.
