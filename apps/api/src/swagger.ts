import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/**
 * Builds the OpenAPI document. Shared between `main.ts` (serves it live at
 * /docs in development) and `scripts/export-openapi.ts` (writes it to disk
 * for `packages/api-client`'s codegen) so the two never drift apart.
 */
export function buildOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Eduvantage API")
    .setDescription("Authoritative business/application API for Eduvantage.")
    .setVersion("0.1.0")
    .build();

  return SwaggerModule.createDocument(app, config);
}
