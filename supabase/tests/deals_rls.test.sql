-- Focused RLS/active-row checks for the Foundation 002 catalog domain.
-- Run via `supabase test db` (or `pg_prove` against a seeded database).
-- Deliberately small — this is not a full database-testing framework, just
-- the invariants that matter most: anon sees exactly the rows the Nest API
-- would also consider "active" (see is_deal_publicly_visible() in the
-- migration), and anon cannot write.

begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

-- --- fixtures, isolated from seed data via a 99999999- id/slug prefix ---
insert into public.merchants (id, name, slug, is_active) values
  ('99999999-0000-4000-9000-000000000001', 'RLS Test Merchant Active', 'rls-test-merchant-active', true),
  ('99999999-0000-4000-9000-000000000002', 'RLS Test Merchant Inactive', 'rls-test-merchant-inactive', false);

insert into public.merchant_locations (id, merchant_id, name, is_active) values
  ('99999999-0000-4000-b000-000000000001', '99999999-0000-4000-9000-000000000001', 'Active location, active merchant', true),
  ('99999999-0000-4000-b000-000000000002', '99999999-0000-4000-9000-000000000001', 'Inactive location, active merchant', false),
  ('99999999-0000-4000-b000-000000000003', '99999999-0000-4000-9000-000000000002', 'Active location, inactive merchant', true);

insert into public.deals (id, merchant_id, title, slug, discount_type, is_active, starts_at, ends_at) values
  ('99999999-0000-4000-a000-000000000001', '99999999-0000-4000-9000-000000000001', 'RLS Active Deal', 'rls-test-active-deal', 'other', true, null, null),
  ('99999999-0000-4000-a000-000000000002', '99999999-0000-4000-9000-000000000001', 'RLS Inactive Deal', 'rls-test-inactive-deal', 'other', false, null, null),
  ('99999999-0000-4000-a000-000000000003', '99999999-0000-4000-9000-000000000002', 'RLS Deal, Inactive Merchant', 'rls-test-deal-inactive-merchant', 'other', true, null, null),
  ('99999999-0000-4000-a000-000000000004', '99999999-0000-4000-9000-000000000001', 'RLS Future Deal', 'rls-test-future-deal', 'other', true, now() + interval '1 day', null),
  ('99999999-0000-4000-a000-000000000005', '99999999-0000-4000-9000-000000000001', 'RLS Expired Deal', 'rls-test-expired-deal', 'other', true, null, now() - interval '1 day');

-- One institution link on the visible deal (positive case) and one on a
-- deal that should be invisible (the leak this policy must prevent).
insert into public.institutions (id, name, slug) values
  ('99999999-0000-4000-8000-000000000001', 'RLS Test Institution', 'rls-test-institution');
insert into public.deal_institutions (deal_id, institution_id) values
  ('99999999-0000-4000-a000-000000000001', '99999999-0000-4000-8000-000000000001'),
  ('99999999-0000-4000-a000-000000000004', '99999999-0000-4000-8000-000000000001');

set local role anon;

-- --- deals ---
select ok(
  exists(select 1 from public.deals where slug = 'rls-test-active-deal'),
  'anon can see an active, in-window deal from an active merchant'
);

select ok(
  not exists(select 1 from public.deals where slug = 'rls-test-inactive-deal'),
  'anon cannot see an inactive deal'
);

select ok(
  not exists(select 1 from public.deals where slug = 'rls-test-deal-inactive-merchant'),
  'an active deal is hidden when its merchant is inactive'
);

select ok(
  not exists(select 1 from public.deals where slug = 'rls-test-future-deal'),
  'a deal with a future starts_at is not publicly readable yet'
);

select ok(
  not exists(select 1 from public.deals where slug = 'rls-test-expired-deal'),
  'a deal with a past ends_at is no longer publicly readable'
);

-- --- merchants ---
select ok(
  not exists(select 1 from public.merchants where slug = 'rls-test-merchant-inactive'),
  'anon cannot see an inactive merchant'
);

-- --- merchant_locations ---
select ok(
  exists(select 1 from public.merchant_locations where id = '99999999-0000-4000-b000-000000000001'),
  'anon can see an active location of an active merchant'
);

select ok(
  not exists(select 1 from public.merchant_locations where id = '99999999-0000-4000-b000-000000000002'),
  'an inactive location is hidden even though its merchant is active'
);

select ok(
  not exists(select 1 from public.merchant_locations where id = '99999999-0000-4000-b000-000000000003'),
  'an active location is hidden when its merchant is inactive'
);

-- --- deal_institutions: must not leak links for deals anon cannot see ---
select ok(
  exists(
    select 1 from public.deal_institutions
    where deal_id = '99999999-0000-4000-a000-000000000001'
  ),
  'anon can see the institution link for a publicly visible deal'
);

select ok(
  not exists(
    select 1 from public.deal_institutions
    where deal_id = '99999999-0000-4000-a000-000000000004'
  ),
  'anon cannot see the institution link for a not-yet-started deal'
);

-- --- writes ---
select throws_ok(
  $$ insert into public.merchants (name, slug) values ('Should Fail', 'should-fail') $$,
  '42501',
  null,
  'anon cannot insert into merchants'
);

update public.deals set title = 'HACKED' where slug = 'rls-test-active-deal';

select is(
  (select title from public.deals where slug = 'rls-test-active-deal'),
  'RLS Active Deal',
  'anon update on a visible deal is silently blocked by RLS (no write policy)'
);

reset role;

-- Sanity check for the documented trust boundary (docs/ARCHITECTURE.md):
-- the privileged connection this test runs as by default (table owner)
-- bypasses RLS and sees rows anon cannot — the same class of access
-- apps/api's DATABASE_URL has, which is exactly why every repository
-- query must filter for itself instead of relying on RLS.
select ok(
  (select is_active from public.merchants where slug = 'rls-test-merchant-inactive') = false,
  'the privileged (table owner) connection bypasses RLS and sees inactive rows'
);

select * from finish();
rollback;
