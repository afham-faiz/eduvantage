# Seed data

`seed.sql` (run automatically by `supabase db reset`) populates local
Postgres with demo institutions, merchants, merchant locations, and one
deal per merchant.

**The merchant names are real (per the product brief); the deal copy,
discounts, and terms are placeholder demo content** — not confirmed real
offers. Swap for real merchant-submitted deals before launch.

Every insert is keyed on its unique slug/id with `on conflict ... do
nothing`, so re-running the file against a non-empty database is a no-op
rather than an error.
