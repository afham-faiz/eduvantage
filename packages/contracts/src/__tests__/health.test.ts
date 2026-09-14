import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "../health.js";

describe("HealthResponseSchema", () => {
  it("accepts a valid health payload", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = HealthResponseSchema.safeParse({
      status: "down",
      service: "api",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
