import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DealsService } from "./deals.service";
import { DealsRepository, type DealRow } from "./deals.repository";

/**
 * "Active deal / inactive deal exclusion / active merchant requirement" is
 * enforced by SQL in DealsRepository (see its `activeDealsQuery`) — that's
 * exercised by the pgTAP tests under supabase/tests/, not re-implemented
 * here. This suite covers what the service is actually responsible for:
 * shaping repository rows into the API contract, forwarding filters, and
 * turning "not found" into the right exception.
 */
describe("DealsService", () => {
  let service: DealsService;
  let repository: { findActive: jest.Mock; findActiveBySlug: jest.Mock };

  const row: DealRow = {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "clay-studio-student-pottery-session",
    title: "Student Pottery Session",
    description: "15% off a walk-in pottery wheel session.",
    terms: "Valid with student ID.",
    discountType: "percentage",
    discountValue: 15,
    startsAt: null,
    endsAt: null,
    isFeatured: true,
    merchant: {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Clay Studio",
      slug: "clay-studio",
      logoUrl: null,
    },
  };

  beforeEach(async () => {
    repository = {
      findActive: jest.fn(),
      findActiveBySlug: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [DealsService, { provide: DealsRepository, useValue: repository }],
    }).compile();

    service = module.get(DealsService);
  });

  describe("listDeals", () => {
    it("maps repository rows onto the API contract shape", async () => {
      repository.findActive.mockResolvedValue([row]);

      const result = await service.listDeals({});

      expect(result).toEqual([
        {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          terms: row.terms,
          discountType: "percentage",
          discountValue: 15,
          startsAt: null,
          endsAt: null,
          isFeatured: true,
          merchant: row.merchant,
        },
      ]);
    });

    it("formats non-null starts_at/ends_at as ISO strings", async () => {
      repository.findActive.mockResolvedValue([
        {
          ...row,
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-02-01T00:00:00.000Z"),
        },
      ]);

      const [deal] = await service.listDeals({});

      expect(deal?.startsAt).toBe("2026-01-01T00:00:00.000Z");
      expect(deal?.endsAt).toBe("2026-02-01T00:00:00.000Z");
    });

    it("forwards filters to the repository unchanged", async () => {
      repository.findActive.mockResolvedValue([]);

      await service.listDeals({ featured: true, institutionSlug: "chse-male" });

      expect(repository.findActive).toHaveBeenCalledWith({
        featured: true,
        institutionSlug: "chse-male",
      });
    });

    it("returns an empty list when the repository finds nothing", async () => {
      repository.findActive.mockResolvedValue([]);

      await expect(service.listDeals({})).resolves.toEqual([]);
    });
  });

  describe("getDealBySlug", () => {
    it("returns the mapped deal when the repository finds one", async () => {
      repository.findActiveBySlug.mockResolvedValue(row);

      const result = await service.getDealBySlug(row.slug);

      expect(result.slug).toBe(row.slug);
      expect(repository.findActiveBySlug).toHaveBeenCalledWith(row.slug);
    });

    it("throws NotFoundException when the repository finds nothing", async () => {
      repository.findActiveBySlug.mockResolvedValue(undefined);

      await expect(service.getDealBySlug("does-not-exist")).rejects.toThrow(NotFoundException);
    });
  });
});
