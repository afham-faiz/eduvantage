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
  // abortOnError defaults to true, which makes Nest call process.exit()
  // itself on a bootstrap failure (e.g. a provider throwing in its
  // constructor) — bypassing our catch below entirely and, combined with
  // `logger: false`, failing completely silently. false lets the error
  // reach us so it's actually reported.
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
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
  // Set exitCode rather than calling process.exit() directly — exit()
  // can terminate the process before a piped/redirected stderr write
  // finishes flushing, silently swallowing this exact error message.
  process.exitCode = 1;
});
