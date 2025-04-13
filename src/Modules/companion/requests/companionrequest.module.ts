import { Module } from '@nestjs/common';
import { CompanionRequestCotroller } from './companionrequest.controller';
import { CompanionRequestService } from './companionrequest.service';
import { S3Service } from 'src/Services/s3.service';

@Module({
  controllers: [CompanionRequestCotroller],
  providers: [CompanionRequestService, S3Service],
})
export class CompanionRequestModule {}