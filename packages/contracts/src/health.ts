import { z } from "zod";

/**
 * Response shape for GET /v1/health.
 * Kept intentionally tiny — this exists to prove the contract -> client
 * pipeline, not to model a real domain.
 */
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
