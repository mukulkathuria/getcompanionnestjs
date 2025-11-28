import { Module } from "@nestjs/common";
import { CompanionDashboardController } from "./dashboard.controller";
import { CompanionDashboardService } from "./dashboard.service";

@Module({
    controllers: [CompanionDashboardController],
    providers: [CompanionDashboardService],
    imports: [],
    exports: [],
})
export class CompanionDashboardModule {}