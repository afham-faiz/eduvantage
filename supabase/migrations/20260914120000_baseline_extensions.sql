-- Baseline migration for Foundation 001.
--
-- Enables the extensions every future product migration will assume are
-- present (UUID generation). No product tables are created here — schema
-- design starts with the first real domain (e.g. institutions/students).
--
-- supabase/migrations/ is the ONLY authoritative schema history for this
-- project. Do not introduce a second migration framework (e.g. Kysely
-- migrations) — see docs/ARCHITECTURE.md.

create extension if not exists pgcrypto with schema extensions;
