import { Module } from '@nestjs/common';
import { AdminCompanionModule } from './companion/companion.module';
import { AcceptanceModule } from './acceptance/acceptance.module';
import { AdminBookingModule } from './adminbooking/adminbooking.module';

@Module({
  imports: [AdminCompanionModule, AcceptanceModule, AdminBookingModule],
})
export class AdminModule {}
