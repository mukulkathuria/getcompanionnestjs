import { Module } from '@nestjs/common';
import { UserBookingController } from './userbooking.controller';
import { UserBookingsService } from './userbooking.service';

@Module({
  controllers: [UserBookingController],
  providers: [UserBookingsService],
})
export class UserBookingModule {}
