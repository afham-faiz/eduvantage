import { Injectable } from "@nestjs/common";
import type { DiscountType } from "@eduvantage/contracts";
import { DatabaseService } from "../../database/database.service";

export interface DealRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  terms: string | null;
  discountType: DiscountType;
  discountValue: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isFeatured: boolean;
  merchant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export interface DealListFilters {
  /** Only featured deals when true; no filtering when undefined. */
  featured?: boolean;
  /** Institution slug — see eligibility semantics in the class doc. */
  institutionSlug?: string;
}

/**
 * Database access for deals — Kysely query building only, no business
 * rules beyond "what does 'active' mean" (a single source of truth every
 * public deal query shares).
 *
 * Institution eligibility: a deal with no rows in deal_institutions is
 * open to every institution; a deal with rows is limited to exactly those
 * institutions. Filtering by `institutionSlug` therefore matches deals
 * that are either untargeted or explicitly target that institution.
 */
@Injectable()
export class DealsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findActive(filters: DealListFilters = {}): Promise<DealRow[]> {
    let query = this.activeDealsQuery();

    if (filters.featured) {
      query = query.where("deals.is_featured", "=", true);
    }

    if (filters.institutionSlug) {
      const institutionSlug = filters.institutionSlug;
      query = query.where((eb) =>
        eb.or([
          eb.not(
            eb.exists(
              eb
                .selectFrom("deal_institutions")
                .select("deal_institutions.deal_id")
                .whereRef("deal_institutions.deal_id", "=", "deals.id"),
            ),
          ),
          eb.exists(
            eb
              .selectFrom("deal_institutions")
              .innerJoin("institutions", "institutions.id", "deal_institutions.institution_id")
              .select("deal_institutions.deal_id")
              .whereRef("deal_institutions.deal_id", "=", "deals.id")
              .where("institutions.slug", "=", institutionSlug),
          ),
        ]),
      );
    }

    const rows = await query
      .orderBy("deals.is_featured", "desc")
      .orderBy("deals.created_at", "desc")
      .execute();

    return rows.map(mapRow);
  }

  async findActiveBySlug(slug: string): Promise<DealRow | undefined> {
    const row = await this.activeDealsQuery().where("deals.slug", "=", slug).executeTakeFirst();

    return row ? mapRow(row) : undefined;
  }

  /**
   * Base query every public deal read shares: active deal, active
   * merchant, and within its start/end window. A null starts_at/ends_at
   * means "no bound on that side" (see the migration's column comments).
   */
  private activeDealsQuery() {
    return this.db
      .selectFrom("deals")
      .innerJoin("merchants", "merchants.id", "deals.merchant_id")
      .select([
        "deals.id",
        "deals.slug",
        "deals.title",
        "deals.description",
        "deals.terms",
        "deals.discount_type",
        "deals.discount_value",
        "deals.starts_at",
        "deals.ends_at",
        "deals.is_featured",
        "merchants.id as merchantId",
        "merchants.name as merchantName",
        "merchants.slug as merchantSlug",
        "merchants.logo_url as merchantLogoUrl",
      ])
      .where("deals.is_active", "=", true)
      .where("merchants.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("deals.starts_at", "is", null), eb("deals.starts_at", "<=", new Date())]),
      )
      .where((eb) =>
        eb.or([eb("deals.ends_at", "is", null), eb("deals.ends_at", ">=", new Date())]),
      );
  }
}

interface RawDealRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  terms: string | null;
  discount_type: DiscountType;
  discount_value: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  is_featured: boolean;
  merchantId: string;
  merchantName: string;
  merchantSlug: string;
  merchantLogoUrl: string | null;
}

function mapRow(row: RawDealRow): DealRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    terms: row.terms,
    discountType: row.discount_type,
    // `numeric` columns come back as strings from node-postgres to avoid
    // silent float precision loss — convert deliberately, once, here.
    discountValue: row.discount_value === null ? null : Number(row.discount_value),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isFeatured: row.is_featured,
    merchant: {
      id: row.merchantId,
      name: row.merchantName,
      slug: row.merchantSlug,
      logoUrl: row.merchantLogoUrl,
    },
  };
}
