import { Module } from '@nestjs/common';
import { S3Service } from 'src/Services/s3.service';
import { CompanionRequestModule } from './requests/companionrequest.module';

@Module({
  imports: [CompanionRequestModule],
  providers: [S3Service],
})
export class CompanionModule {}
