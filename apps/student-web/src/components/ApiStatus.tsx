"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@eduvantage/api-client";

type Status = "checking" | "ok" | "unreachable" | "not-configured";

/**
 * Proves the full pipeline end to end:
 *   apps/api (NestJS) -> OpenAPI -> generated @eduvantage/api-client -> here.
 *
 * Deliberately the only place in this foundation that calls the API — every
 * other page is a static placeholder.
 */
export function ApiStatus() {
  // Known synchronously at render time — no effect needed to derive it, so
  // the effect below only ever calls setState from an async completion
  // (react-hooks/set-state-in-effect wants exactly that split).
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [status, setStatus] = useState<Status>(baseUrl ? "checking" : "not-configured");

  useEffect(() => {
    if (!baseUrl) return;

    const client = createApiClient({ baseUrl });
    client
      .GET("/v1/health")
      .then(({ data, error }) => {
        setStatus(!error && data?.status === "ok" ? "ok" : "unreachable");
      })
      .catch(() => setStatus("unreachable"));
  }, [baseUrl]);

  const label: Record<Status, string> = {
    checking: "Checking API…",
    ok: "API reachable ✅",
    unreachable: "API unreachable — is `pnpm --filter @eduvantage/api dev` running?",
    "not-configured": "NEXT_PUBLIC_API_URL not set — see .env.example",
  };

  return <p className="text-sm text-neutral-500">{label[status]}</p>;
}
