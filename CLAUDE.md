# CLAUDE.md — Eduvantage

Rules for Claude Code sessions working in this repo. Keep this file short —
if it starts growing into a policy manual, that's a sign to prune it.

## Before editing

- Inspect the relevant code/config before changing it. Don't assume — read
  the actual module, migration, or package first.
- Stay inside the scope of the task you were given. Don't refactor
  unrelated code, rename things "while you're in there", or expand a small
  ask into a redesign.

## Architecture — do not invent, do not bypass

See `docs/ARCHITECTURE.md` for the full picture. In short:

- NestJS (`apps/api`) is the one authoritative business API. Business rules
  do not live in `student-web`, `merchant-web`, `admin-web`, or the mobile
  apps — those call the API through `packages/api-client`.
- `supabase/migrations/` is the only database schema authority. Do not add
  a second migration tool.
- Do not add Prisma, Better Auth, Redis, BullMQ, or microservices without
  explicit approval from Afham — these are locked-out by design, not by
  oversight.
- Don't silently bypass module boundaries (e.g. a web app reaching into
  another app's source, or a Nest module querying another module's tables
  directly instead of going through its service).
- Generated code (`packages/api-client/src/generated/**`, and anything else
  clearly marked "AUTO-GENERATED") is never hand-edited. Change the source
  (the Nest controllers/DTOs) and regenerate with `pnpm generate:api`.
- Schema changes are a new file in `supabase/migrations/`, never an edit to
  an already-applied migration.

## Working style

- Run the relevant validation before calling something done: typecheck,
  lint, and tests for whatever you touched at minimum
  (`pnpm typecheck` / `pnpm lint` / `pnpm test`, or scoped with
  `pnpm --filter <package>`).
- Report blockers clearly and early — don't quietly work around a failing
  install, a missing env var, or a broken script. Say what failed and what
  you tried.
- If a task as described would require changing a major architectural
  assumption above (e.g. "let's just query Postgres directly from
  student-web"), stop and say so instead of doing it.

## Team

Afham (CEO, backend-focused, still learning — keep backend code
conventional and readable), Ailam (design + frontend, owns the real design
system — don't lock him into decisions in `packages/design-tokens` or
`packages/ui-web`), Ajmal (full-stack, can touch backend but doesn't own
its architecture). This is a 3-person startup — keep process light.
