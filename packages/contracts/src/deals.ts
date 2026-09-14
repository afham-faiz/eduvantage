import { z } from "zod";

/**
 * Student-facing deal shapes returned by GET /v1/deals and
 * GET /v1/deals/:slug. camelCase on the wire, even though the database is
 * snake_case — the Nest layer maps between the two, see
 * apps/api/src/modules/deals/.
 */

export const DiscountTypeSchema = z.enum(["percentage", "fixed_amount", "special_price", "other"]);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

export const DealMerchantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
});
export type DealMerchant = z.infer<typeof DealMerchantSchema>;

export const DealSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  terms: z.string().nullable(),
  discountType: DiscountTypeSchema,
  /** Null for descriptive deals with no single numeric value. */
  discountValue: z.number().nullable(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  isFeatured: z.boolean(),
  merchant: DealMerchantSchema,
});
export type Deal = z.infer<typeof DealSchema>;

export const DealListResponseSchema = z.object({
  deals: z.array(DealSchema),
});
export type DealListResponse = z.infer<typeof DealListResponseSchema>;
