import { Module } from '@nestjs/common';
import { CompanionRequestCotroller } from './companionrequest.controller';
import { CompanionRequestService } from './companionrequest.service';

@Module({
  controllers: [CompanionRequestCotroller],
  providers: [CompanionRequestService],
})
export class CompanionRequestModule {}