import { Module } from '@nestjs/common';
import { AdminCompanionModule } from './companion/companion.module';
import { AcceptanceModule } from './acceptance/acceptance.module';
import { AdminBookingModule } from './adminbooking/adminbooking.module';
import { S3Service } from 'src/Services/s3.service';
import { AdminIssuesModule } from './issues/adminissues.module';
import { AdminNotificationModule } from './notifications/adminnotification.module';

@Module({
  imports: [
    AdminCompanionModule,
    AcceptanceModule,
    AdminBookingModule,
    AdminIssuesModule,
    AdminNotificationModule
  ],
  providers: [S3Service],
})
export class AdminModule {}
