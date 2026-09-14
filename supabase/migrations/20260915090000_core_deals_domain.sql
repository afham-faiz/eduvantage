-- Foundation 002: core Eduvantage catalog domain.
--
-- Institutions, merchants (+ locations), deals, and the deal/institution
-- eligibility join table. This is deliberately the whole first domain in
-- one migration — see docs/ARCHITECTURE.md for the access model.
--
-- Student accounts/verification are intentionally NOT modelled yet — see
-- the "Verification-ready model" note in docs/ARCHITECTURE.md for exactly
-- how that lands later without reshaping anything created here.

-- Shared trigger: keep `updated_at` current on every UPDATE. Applied to
-- every table below that has the column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- institutions — schools, colleges, universities a deal can target.
-- ---------------------------------------------------------------------
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  institution_type text not null default 'other',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint institutions_slug_unique unique (slug),
  constraint institutions_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint institutions_type_check check (
    institution_type in ('school', 'college', 'university', 'other')
  )
);

comment on table public.institutions is
  'Schools/colleges/universities. Deals may optionally target specific '
  'institutions via deal_institutions.';

create trigger institutions_set_updated_at
  before update on public.institutions
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- merchants — businesses on Eduvantage. No billing/subscription fields.
-- ---------------------------------------------------------------------
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchants_slug_unique unique (slug),
  constraint merchants_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create trigger merchants_set_updated_at
  before update on public.merchants
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- merchant_locations — a merchant may have zero or more locations.
-- ---------------------------------------------------------------------
create table public.merchant_locations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  name text not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index merchant_locations_merchant_id_idx on public.merchant_locations (merchant_id);

create trigger merchant_locations_set_updated_at
  before update on public.merchant_locations
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- deals — student offers. Slugs are globally unique (GET /v1/deals/:slug
-- is not merchant-scoped).
-- ---------------------------------------------------------------------
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  terms text,
  discount_type text not null default 'other',
  discount_value numeric(10, 2),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_slug_unique unique (slug),
  constraint deals_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint deals_discount_type_check check (
    discount_type in ('percentage', 'fixed_amount', 'special_price', 'other')
  ),
  -- Descriptive deals (discount_type = 'other') may have no numeric value.
  -- When a value is present it must be non-negative, and a percentage may
  -- not exceed 100.
  constraint deals_discount_value_check check (
    discount_value is null
    or (discount_value >= 0 and (discount_type <> 'percentage' or discount_value <= 100))
  ),
  constraint deals_date_range_check check (
    starts_at is null or ends_at is null or ends_at >= starts_at
  )
);

comment on column public.deals.starts_at is
  'Null means "available immediately" — no start-date gating.';
comment on column public.deals.ends_at is
  'Null means "no end date" — the deal does not expire on its own.';

create index deals_merchant_id_idx on public.deals (merchant_id);
-- Serves the catalog's dominant query: active deals, newest first.
create index deals_active_created_at_idx on public.deals (created_at desc) where is_active;

create trigger deals_set_updated_at
  before update on public.deals
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- deal_institutions — optional eligibility targeting.
--
-- No rows for a deal = available to all eligible verified students.
-- One or more rows = the deal is limited to those institutions.
-- ---------------------------------------------------------------------
create table public.deal_institutions (
  deal_id uuid not null references public.deals (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (deal_id, institution_id)
);

comment on table public.deal_institutions is
  'Optional deal -> institution eligibility targeting. No rows for a given '
  'deal_id means that deal is open to all institutions.';

-- The primary key already indexes deal_id first; institution_id needs its
-- own index for the reverse lookup ("deals for institution X").
create index deal_institutions_institution_id_idx on public.deal_institutions (institution_id);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Baseline only — see docs/ARCHITECTURE.md for the full security model.
-- No authenticated-user policies yet (no auth flows exist). Public catalog
-- data is readable by anon/authenticated; nothing is anonymously writable.
-- apps/api connects with a privileged direct Postgres role and therefore
-- bypasses RLS — these policies are a defense-in-depth boundary for any
-- other access path, not the mechanism Nest itself relies on.
-- ---------------------------------------------------------------------
alter table public.institutions enable row level security;
alter table public.merchants enable row level security;
alter table public.merchant_locations enable row level security;
alter table public.deals enable row level security;
alter table public.deal_institutions enable row level security;

create policy "Public can read active institutions"
  on public.institutions
  for select
  to anon, authenticated
  using (is_active);

create policy "Public can read active merchants"
  on public.merchants
  for select
  to anon, authenticated
  using (is_active);

create policy "Public can read active locations of active merchants"
  on public.merchant_locations
  for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.merchants m
      where m.id = merchant_locations.merchant_id and m.is_active
    )
  );

-- Single source of truth for "is this deal publicly visible" — used by
-- both the deals policy and the deal_institutions policy below, so the
-- two can never drift out of sync with each other or with
-- DealsRepository's activeDealsQuery().
create or replace function public.is_deal_publicly_visible(deal public.deals)
returns boolean
language sql
stable
as $$
  select
    deal.is_active
    and (deal.starts_at is null or deal.starts_at <= now())
    and (deal.ends_at is null or deal.ends_at >= now())
    and exists (
      select 1 from public.merchants m
      where m.id = deal.merchant_id and m.is_active
    );
$$;

create policy "Public can read publicly visible deals"
  on public.deals
  for select
  to anon, authenticated
  using (public.is_deal_publicly_visible(deals));

create policy "Public can read institution links for publicly visible deals"
  on public.deal_institutions
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_institutions.deal_id and public.is_deal_publicly_visible(d)
    )
  );

-- No insert/update/delete policies for anon/authenticated on any of the
-- above: RLS defaults to deny, so write access stays server-side only.
