import { Module } from "@nestjs/common";
import { CompanionSettingService } from "./companionsetting.service";
import { CompanionSettingController } from "./compnaionsetting.controller";

@Module({
  controllers: [CompanionSettingController],
  providers: [CompanionSettingService],
})
export class CompanionSettingModule {}