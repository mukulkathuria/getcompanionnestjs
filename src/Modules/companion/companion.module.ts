import { Module } from '@nestjs/common';
import { S3Service } from 'src/Services/s3.service';
import { CompanionRequestModule } from './requests/companionrequest.module';
import { CompanionBookingModule } from './bookings/companionbooking.module';
import { CompanionAnalysisModule } from './analysis/companionanalysis.module';
import { CompanionSettingModule } from './setting/companionsetting.module';

@Module({
  imports: [
    CompanionRequestModule,
    CompanionBookingModule,
    CompanionAnalysisModule,
    CompanionSettingModule,
  ],
  providers: [S3Service],
})
export class CompanionModule {}
