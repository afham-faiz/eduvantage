import "reflect-metadata";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { buildOpenApiDocument } from "../src/swagger";
import { API_GLOBAL_PREFIX } from "../src/constants";

/**
 * Boots the Nest app just long enough to build the OpenAPI document and
 * write it to disk (no `.listen()` — nothing actually serves traffic).
 * Consumed by packages/api-client's `pnpm generate` step.
 */
async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  await app.init();

  const document = buildOpenApiDocument(app);
  const outPath = path.resolve(__dirname, "../openapi.json");
  writeFileSync(outPath, JSON.stringify(document, null, 2));
  console.log(`[export:openapi] wrote ${outPath}`);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
