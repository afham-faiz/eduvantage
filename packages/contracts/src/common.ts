import { z } from "zod";

/**
 * Generic error envelope returned by the API for non-2xx responses.
 * Domain-specific error codes are added alongside the modules that need
 * them — this is only the shared shape.
 */
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
