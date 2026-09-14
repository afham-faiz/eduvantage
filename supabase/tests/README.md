# Database tests

[pgTAP](https://supabase.com/docs/guides/database/extensions/pgtap) tests,
run via `supabase test db`. `deals_rls.test.sql` covers the Foundation 002
RLS baseline: anon sees only active merchants/deals, anon cannot write,
and the privileged (table-owner) connection Nest actually uses bypasses
RLS. Add more here as real schema/RLS behaviour is worth asserting on —
this is intentionally not a full database-testing framework.
