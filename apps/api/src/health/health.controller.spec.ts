import { Test } from "@nestjs/testing";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get(HealthController);
  });

  it("reports healthy status", () => {
    const result = controller.getHealth();
    expect(result.status).toBe("ok");
    expect(result.service).toBe("api");
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
