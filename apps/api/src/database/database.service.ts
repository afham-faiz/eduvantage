import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./database.types";

/**
 * Typed Postgres access for the whole API, via a direct connection (not
 * Supabase's PostgREST/Data API). `DatabaseService` *is* a `Kysely<Database>`
 * — inject it into a repository and query it directly:
 *
 *   constructor(private readonly db: DatabaseService) {}
 *   this.db.selectFrom("deals")...
 *
 * Security: `DATABASE_URL` is a server-only secret (never sent to a
 * browser/mobile bundle) — a direct PostgreSQL connection, not Supabase's
 * service-role JWT or Data API. In local dev it connects as a privileged
 * role that bypasses Row-Level Security; treat it as bypassing RLS in
 * general unless a given environment's role is confirmed otherwise. RLS
 * on the tables is therefore a defense-in-depth boundary for other access
 * paths, not something this service relies on — every query here must
 * apply its own explicit filters (e.g. `is_active`). See
 * docs/ARCHITECTURE.md.
 */
@Injectable()
export class DatabaseService extends Kysely<Database> implements OnModuleDestroy {
  private static readonly logger = new Logger(DatabaseService.name);

  constructor(config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");
    if (!connectionString) {
      // Fail fast at startup rather than on the first query.
      throw new Error(
        "DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env and " +
          "fill it in (see supabase/ for local connection details).",
      );
    }

    super({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString }),
      }),
    });

    DatabaseService.logger.log("Database pool initialized");
  }

  async onModuleDestroy() {
    await this.destroy();
  }
}
