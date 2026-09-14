import type { Generated } from "kysely";

/**
 * Kysely's typed view of the Postgres schema owned by supabase/migrations/.
 * This file is hand-written and must be kept in sync with the migrations —
 * there is no schema-introspection codegen step (yet). Column names are
 * snake_case, matching the database exactly; camelCase mapping happens in
 * each module's service, not here.
 */

export type InstitutionType = "school" | "college" | "university" | "other";

export type DiscountType = "percentage" | "fixed_amount" | "special_price" | "other";

export interface InstitutionsTable {
  id: Generated<string>;
  name: string;
  slug: string;
  institution_type: InstitutionType;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface MerchantsTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface MerchantLocationsTable {
  id: Generated<string>;
  merchant_id: string;
  name: string;
  address: string | null;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DealsTable {
  id: Generated<string>;
  merchant_id: string;
  title: string;
  slug: string;
  description: string | null;
  terms: string | null;
  discount_type: DiscountType;
  /**
   * Postgres `numeric` — node-postgres returns this as a string to avoid
   * silent float precision loss. Callers convert to `number` explicitly
   * where needed (see deals.repository.ts).
   */
  discount_value: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  is_active: Generated<boolean>;
  is_featured: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DealInstitutionsTable {
  deal_id: string;
  institution_id: string;
  created_at: Generated<Date>;
}

export interface Database {
  institutions: InstitutionsTable;
  merchants: MerchantsTable;
  merchant_locations: MerchantLocationsTable;
  deals: DealsTable;
  deal_institutions: DealInstitutionsTable;
}
