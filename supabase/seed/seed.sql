-- Local development / demo seed data for Foundation 002.
--
-- IMPORTANT: merchant names are real (per product brief) but the deal
-- copy, discounts, and terms below are PLACEHOLDER demo content — not
-- confirmed real offers. Swap for real merchant-submitted deals before
-- launch (see docs/PRODUCT.md).
--
-- Safe to re-run: every insert is keyed on its unique slug with
-- ON CONFLICT DO NOTHING, so re-running this file against a non-empty
-- database is a no-op rather than an error. The normal local workflow
-- (`supabase db reset`) already starts from an empty database.

-- ---------------------------------------------------------------------
-- institutions
-- ---------------------------------------------------------------------
insert into public.institutions (id, name, slug, institution_type) values
  ('00000000-0000-4000-8000-000000000001', 'CHSE Malé', 'chse-male', 'college'),
  ('00000000-0000-4000-8000-000000000002', 'CHSE Hulhumalé', 'chse-hulhumale', 'college'),
  ('00000000-0000-4000-8000-000000000003', 'Ahmadiyya International School', 'ahmadiyya-international-school', 'school'),
  ('00000000-0000-4000-8000-000000000004', 'Villa International High School', 'villa-international-high-school', 'school'),
  ('00000000-0000-4000-8000-000000000005', 'Maldives National University', 'maldives-national-university', 'university'),
  ('00000000-0000-4000-8000-000000000006', 'Villa College', 'villa-college', 'college'),
  ('00000000-0000-4000-8000-000000000007', 'Maldives Polytechnic', 'maldives-polytechnic', 'college')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- merchants
-- ---------------------------------------------------------------------
insert into public.merchants (id, name, slug, description, is_active) values
  ('00000000-0000-4000-9000-000000000001', 'Clay Studio', 'clay-studio', 'Ceramics studio and cafe in Malé.', true),
  ('00000000-0000-4000-9000-000000000002', 'Ast', 'ast', 'Lifestyle and fashion store.', true),
  ('00000000-0000-4000-9000-000000000003', 'Bianco', 'bianco', 'Casual Italian restaurant.', true),
  ('00000000-0000-4000-9000-000000000004', 'Blood Orange', 'blood-orange', 'Cafe and juice bar.', true),
  ('00000000-0000-4000-9000-000000000005', 'Scoop', 'scoop', 'Ice cream and dessert parlour.', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- merchant_locations — one per merchant to start.
-- ---------------------------------------------------------------------
insert into public.merchant_locations (id, merchant_id, name, address, is_active) values
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-9000-000000000001', 'Clay Studio — Malé', 'Chandhanee Magu, Malé', true),
  ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-9000-000000000002', 'Ast — Malé', 'Majeedhee Magu, Malé', true),
  ('00000000-0000-4000-b000-000000000003', '00000000-0000-4000-9000-000000000003', 'Bianco — Malé', 'Boduthakurufaanu Magu, Malé', true),
  ('00000000-0000-4000-b000-000000000004', '00000000-0000-4000-9000-000000000004', 'Blood Orange — Hulhumalé', 'Medhuziyaaraiy Magu, Hulhumalé', true),
  ('00000000-0000-4000-b000-000000000005', '00000000-0000-4000-9000-000000000005', 'Scoop — Hulhumalé', 'Lily Magu, Hulhumalé', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- deals — one demo deal per merchant.
-- ---------------------------------------------------------------------
insert into public.deals (
  id, merchant_id, title, slug, description, terms,
  discount_type, discount_value, is_active, is_featured
) values
  (
    '00000000-0000-4000-a000-000000000001',
    '00000000-0000-4000-9000-000000000001',
    'Student Pottery Session',
    'clay-studio-student-pottery-session',
    '15% off a walk-in pottery wheel session, weekdays only.',
    'Valid with student ID. Weekdays only. Not combinable with other offers.',
    'percentage', 15, true, true
  ),
  (
    '00000000-0000-4000-a000-000000000002',
    '00000000-0000-4000-9000-000000000002',
    'Student Wardrobe Edit',
    'ast-student-wardrobe-edit',
    'A special student price on a curated seasonal edit — ask in-store.',
    'Valid with student ID. Selected items only, while stocks last.',
    'special_price', null, true, false
  ),
  (
    '00000000-0000-4000-a000-000000000003',
    '00000000-0000-4000-9000-000000000003',
    'Weekday Student Lunch',
    'bianco-weekday-student-lunch',
    'MVR 25 off any pasta or pizza at lunch, Sunday to Thursday.',
    'Valid with student ID, 12:00–15:00, Sunday–Thursday. Dine-in only.',
    'fixed_amount', 25, true, true
  ),
  (
    '00000000-0000-4000-a000-000000000004',
    '00000000-0000-4000-9000-000000000004',
    'Student Juice & Smoothie Deal',
    'blood-orange-student-juice-smoothie-deal',
    '10% off any juice or smoothie.',
    'Valid with student ID. Dine-in and takeaway.',
    'percentage', 10, true, false
  ),
  (
    '00000000-0000-4000-a000-000000000005',
    '00000000-0000-4000-9000-000000000005',
    'Student Scoop Combo',
    'scoop-student-scoop-combo',
    'Two scoops plus a topping at a fixed student price.',
    'Valid with student ID. One combo per visit.',
    'special_price', null, true, false
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- deal_institutions — demonstrate targeted eligibility. The Clay Studio
-- deal is limited to a couple of institutions; every other deal has no
-- rows here, meaning it's open to students from any institution.
-- ---------------------------------------------------------------------
insert into public.deal_institutions (deal_id, institution_id) values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000002')
on conflict (deal_id, institution_id) do nothing;
