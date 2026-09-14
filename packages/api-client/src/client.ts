import createFetchClient from "openapi-fetch";
import type { paths } from "./generated/schema.js";

export type ApiClientOptions = {
  baseUrl: string;
  /** Extra fetch options (e.g. headers, credentials) applied to every request. */
  init?: RequestInit;
};

/**
 * Creates a fully-typed client for the Eduvantage API, derived from the
 * generated OpenAPI schema. Usable from Next.js and (later) Expo — it only
 * relies on the global `fetch`.
 */
export function createApiClient({ baseUrl, init }: ApiClientOptions) {
  return createFetchClient<paths>({ baseUrl, ...init });
}

export type { paths } from "./generated/schema.js";
