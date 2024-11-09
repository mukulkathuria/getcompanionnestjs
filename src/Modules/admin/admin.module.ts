import { Module } from '@nestjs/common';
import { AdminCompanionModule } from './companion/companion.module';
import { AcceptanceModule } from './acceptance/acceptance.module';
import { AdminBookingModule } from './adminbooking/adminbooking.module';
import { S3Service } from 'src/Services/s3.service';

@Module({
  imports: [AdminCompanionModule, AcceptanceModule, AdminBookingModule],
  providers: [S3Service],
})
export class AdminModule {}
