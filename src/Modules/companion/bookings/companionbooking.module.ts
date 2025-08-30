import { Module } from "@nestjs/common";
import { CompanionBookingController } from "./companionbooking.controller";
import { CompanionBookingService } from "./companionbooking.service";
import { AcceptanceService } from "src/Modules/admin/acceptance/acceptance.service";

@Module({
    controllers: [CompanionBookingController],
    providers: [AcceptanceService ,CompanionBookingService]
})
export class CompanionBookingModule{}