import { ApiProperty } from "@nestjs/swagger";

/**
 * Swagger-facing DTO for GET /v1/health.
 *
 * OpenAPI generation in Nest works by reflecting on classes, not on the
 * zod schemas in @eduvantage/contracts — so each endpoint gets a small DTO
 * class like this one for documentation, while the controller return type
 * is still checked against the shared contract type. Keep the two in sync.
 */
export class HealthResponseDto {
  @ApiProperty({ example: "ok", enum: ["ok"] })
  status!: "ok";

  @ApiProperty({ example: "api" })
  service!: string;

  @ApiProperty({ example: "2025-01-01T00:00:00.000Z" })
  timestamp!: string;
}
