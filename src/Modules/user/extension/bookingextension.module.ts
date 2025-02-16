import { Module } from "@nestjs/common";
import { BookingExtentionController } from "./bookingextension.controller";
import { BookingExtentionService } from "./bookingextension.service";

@Module({
    controllers: [BookingExtentionController],
    providers: [BookingExtentionService]
})
export class BookingExtensionModule {}