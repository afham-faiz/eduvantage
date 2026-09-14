import { Injectable, NotFoundException } from "@nestjs/common";
import type { Deal } from "@eduvantage/contracts";
import { DealsRepository, type DealListFilters, type DealRow } from "./deals.repository";

/**
 * Deals business/use-case logic. HTTP concerns live in the controller;
 * SQL lives in the repository. This layer's job is: ask the repository for
 * active deals, shape rows into the API contract, and turn "not found"
 * into the right exception.
 */
@Injectable()
export class DealsService {
  constructor(private readonly dealsRepository: DealsRepository) {}

  async listDeals(filters: DealListFilters): Promise<Deal[]> {
    const rows = await this.dealsRepository.findActive(filters);
    return rows.map(toDeal);
  }

  async getDealBySlug(slug: string): Promise<Deal> {
    const row = await this.dealsRepository.findActiveBySlug(slug);
    if (!row) {
      throw new NotFoundException(`Deal '${slug}' was not found.`);
    }
    return toDeal(row);
  }
}

function toDeal(row: DealRow): Deal {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    terms: row.terms,
    discountType: row.discountType,
    discountValue: row.discountValue,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    isFeatured: row.isFeatured,
    merchant: row.merchant,
  };
}
