import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { DatabaseModule } from "./database/database.module";
import { DealsModule } from "./modules/deals/deals.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    DealsModule,
    // Future product modules register here (see src/modules/).
  ],
})
export class AppModule {}
