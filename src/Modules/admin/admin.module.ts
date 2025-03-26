import { Module } from '@nestjs/common';
import { AdminCompanionModule } from './companion/companion.module';
import { AcceptanceModule } from './acceptance/acceptance.module';
import { AdminBookingModule } from './adminbooking/adminbooking.module';
import { S3Service } from 'src/Services/s3.service';
import { AdminIssuesModule } from './issues/adminissues.module';
import { AdminNotificationModule } from './notifications/adminnotification.module';
import { AdminAccountsModule } from './accounts/adminaccounts.module';
import { AdminTransactionModule } from './transactions/admintransaction.module';
import { DevelopmentModule } from './development/development.module';

@Module({
  imports: [
    AdminCompanionModule,
    AcceptanceModule,
    AdminBookingModule,
    AdminIssuesModule,
    AdminNotificationModule,
    AdminAccountsModule,
    AdminTransactionModule,
    DevelopmentModule
  ],
  providers: [S3Service],
})
export class AdminModule {}
