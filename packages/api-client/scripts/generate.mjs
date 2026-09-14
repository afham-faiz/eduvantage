#!/usr/bin/env node
// Regenerates packages/api-client/src/generated/schema.d.ts from the NestJS
// OpenAPI document.
//
//   NestJS (apps/api) --SwaggerModule--> openapi.json --openapi-typescript--> schema.d.ts
//
// Run via `pnpm generate:api` from the repo root. Do not hand-edit the
// output — this script is the only thing that should write to
// src/generated/**.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "..");
const openapiJsonPath = path.resolve(packageRoot, "../../apps/api/openapi.json");
const outDir = path.resolve(packageRoot, "src/generated");
const outFile = path.join(outDir, "schema.d.ts");

// apps/api imports @eduvantage/contracts, which is only usable once its
// dist/ exists — build it first. Extend this list if apps/api picks up
// more workspace dependencies.
console.log("[generate:api] 1/3 building apps/api's workspace dependencies ...");
execSync("pnpm --filter @eduvantage/contracts run build", { stdio: "inherit" });

console.log("[generate:api] 2/3 exporting OpenAPI document from apps/api ...");
execSync("pnpm --filter @eduvantage/api run export:openapi", {
  stdio: "inherit",
});

console.log("[generate:api] 3/3 generating TypeScript types ...");
const schema = JSON.parse(readFileSync(openapiJsonPath, "utf-8"));
const ast = await openapiTS(schema);
const output = [
  "/* eslint-disable */",
  "// prettier-ignore",
  "/**",
  " * AUTO-GENERATED — do not edit by hand.",
  " * Source: apps/api OpenAPI document. Regenerate with `pnpm generate:api`.",
  " */",
  astToString(ast),
].join("\n");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, output);
console.log(`[generate:api] wrote ${path.relative(process.cwd(), outFile)}`);
