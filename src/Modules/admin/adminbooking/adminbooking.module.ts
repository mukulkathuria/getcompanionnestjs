import { Module } from '@nestjs/common';
import { AdminBookingController } from './adminbooking.controller';
import { AdminBookingService } from './adminbooking.service';

@Module({
  controllers: [AdminBookingController],
  providers: [AdminBookingService],
})
export class AdminBookingModule {}
