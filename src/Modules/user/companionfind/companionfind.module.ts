import { Module } from '@nestjs/common';
import { CompanionFindController } from './companionfind.controller';
import { CompanionFindService } from './companionfind.service';

@Module({
  controllers: [CompanionFindController],
  providers: [CompanionFindService],
})
export class CompanionFindModule {}
