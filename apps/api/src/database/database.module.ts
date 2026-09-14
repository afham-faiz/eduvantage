import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";

/**
 * Global so every feature module can inject `DatabaseService` without each
 * one re-importing this module — there is exactly one connection pool for
 * the whole API. Register once in AppModule.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
