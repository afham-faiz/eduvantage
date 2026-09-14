/* eslint-disable */
// prettier-ignore
/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: apps/api OpenAPI document. Regenerate with `pnpm generate:api`.
 */
export interface paths {
    "/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness check */
        get: operations["HealthController_getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/deals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List active deals
         * @description Active deals from active merchants, within their start/end window. Featured deals sort first, then newest.
         */
        get: operations["DealsController_listDeals"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/deals/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single active deal by slug */
        get: operations["DealsController_getDeal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        HealthResponseDto: {
            /**
             * @example ok
             * @enum {string}
             */
            status: "ok";
            /** @example api */
            service: string;
            /** @example 2025-01-01T00:00:00.000Z */
            timestamp: string;
        };
        DealMerchantDto: {
            /** Format: uuid */
            id: string;
            /** @example Clay Studio */
            name: string;
            /** @example clay-studio */
            slug: string;
            /** @example null */
            logoUrl: Record<string, never> | null;
        };
        DealResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example clay-studio-student-pottery-session */
            slug: string;
            /** @example Student Pottery Session */
            title: string;
            /** @example 15% off a walk-in pottery wheel session. */
            description: Record<string, never> | null;
            /** @example Valid with student ID. Weekdays only. */
            terms: Record<string, never> | null;
            /**
             * @example percentage
             * @enum {string}
             */
            discountType: "percentage" | "fixed_amount" | "special_price" | "other";
            /** @example 15 */
            discountValue: Record<string, never> | null;
            /** Format: date-time */
            startsAt: Record<string, never> | null;
            /** Format: date-time */
            endsAt: Record<string, never> | null;
            isFeatured: boolean;
            merchant: components["schemas"]["DealMerchantDto"];
        };
        DealListResponseDto: {
            deals: components["schemas"]["DealResponseDto"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    HealthController_getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponseDto"];
                };
            };
        };
    };
    DealsController_listDeals: {
        parameters: {
            query?: {
                /** @description Only return featured deals. */
                featured?: boolean;
                /** @description Institution slug. Returns deals open to every institution plus deals explicitly targeting this one. */
                institution?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DealListResponseDto"];
                };
            };
        };
    };
    DealsController_getDeal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DealResponseDto"];
                };
            };
            /** @description No active deal matches that slug. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
