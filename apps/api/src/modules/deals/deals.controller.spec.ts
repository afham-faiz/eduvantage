import { Test } from "@nestjs/testing";
import { DealsController } from "./deals.controller";
import { DealsService } from "./deals.service";
import type { Deal } from "@eduvantage/contracts";

describe("DealsController", () => {
  let controller: DealsController;
  let service: { listDeals: jest.Mock; getDealBySlug: jest.Mock };

  const deal: Deal = {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "clay-studio-student-pottery-session",
    title: "Student Pottery Session",
    description: null,
    terms: null,
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
    service = { listDeals: jest.fn(), getDealBySlug: jest.fn() };

    const module = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [{ provide: DealsService, useValue: service }],
    }).compile();

    controller = module.get(DealsController);
  });

  it("wraps the service's deal list in a { deals } envelope", async () => {
    service.listDeals.mockResolvedValue([deal]);

    const result = await controller.listDeals({});

    expect(result).toEqual({ deals: [deal] });
  });

  it("passes query params through to the service as filters", async () => {
    service.listDeals.mockResolvedValue([]);

    await controller.listDeals({ featured: true, institution: "chse-male" });

    expect(service.listDeals).toHaveBeenCalledWith({
      featured: true,
      institutionSlug: "chse-male",
    });
  });

  it("returns the service's deal for a slug lookup", async () => {
    service.getDealBySlug.mockResolvedValue(deal);

    const result = await controller.getDeal(deal.slug);

    expect(result).toBe(deal);
    expect(service.getDealBySlug).toHaveBeenCalledWith(deal.slug);
  });
});
