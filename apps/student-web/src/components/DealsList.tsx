"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@eduvantage/api-client";
import type { Deal } from "@eduvantage/contracts";

type LoadState = "loading" | "ok" | "error" | "not-configured";

function formatDiscount(deal: Deal): string | null {
  switch (deal.discountType) {
    case "percentage":
      return deal.discountValue !== null ? `${deal.discountValue}% off` : null;
    case "fixed_amount":
      return deal.discountValue !== null ? `MVR ${deal.discountValue} off` : null;
    case "special_price":
      return "Special student price";
    case "other":
    default:
      return null;
  }
}

/**
 * Foundation 002 integration proof: real seeded deals, fetched through
 * apps/api via the generated client — never Supabase directly from here.
 * Deliberately plain markup; Ailam owns the real UI.
 */
export function DealsList() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [state, setState] = useState<LoadState>(baseUrl ? "loading" : "not-configured");
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (!baseUrl) return;

    const client = createApiClient({ baseUrl });
    client
      .GET("/v1/deals")
      .then(({ data, error }) => {
        if (error || !data) {
          setState("error");
          return;
        }
        setDeals(data.deals);
        setState("ok");
      })
      .catch(() => setState("error"));
  }, [baseUrl]);

  if (state === "not-configured") {
    return (
      <p className="text-sm text-neutral-500">NEXT_PUBLIC_API_URL not set — see .env.example.</p>
    );
  }

  if (state === "loading") {
    return <p className="text-sm text-neutral-500">Loading deals…</p>;
  }

  if (state === "error") {
    return (
      <p className="text-sm text-red-600">
        Couldn&apos;t load deals — is `pnpm --filter @eduvantage/api dev` running?
      </p>
    );
  }

  if (deals.length === 0) {
    return <p className="text-sm text-neutral-500">No deals available right now.</p>;
  }

  return (
    <ul className="grid w-full max-w-2xl gap-4">
      {deals.map((deal) => {
        const discount = formatDiscount(deal);
        return (
          <li key={deal.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              {deal.merchant.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- placeholder, no next/image config yet
                <img
                  src={deal.merchant.logoUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-500">
                  {deal.merchant.name.charAt(0)}
                </span>
              )}
              <span className="text-sm font-medium text-neutral-700">{deal.merchant.name}</span>
              {deal.isFeatured && (
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
                  Featured
                </span>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{deal.title}</h3>
            {deal.description && (
              <p className="mt-1 text-sm text-neutral-600">{deal.description}</p>
            )}
            {discount && <p className="mt-2 text-sm font-medium text-neutral-900">{discount}</p>}
          </li>
        );
      })}
    </ul>
  );
}
