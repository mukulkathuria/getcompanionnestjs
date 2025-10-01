import { Module } from '@nestjs/common';
import { CompanionAnalysisController } from './companionanalysis.controller';
import { CompanionAnalysisService } from './companionanalysis.service';

@Module({
  controllers: [CompanionAnalysisController],
  providers: [CompanionAnalysisService],
})
export class CompanionAnalysisModule {}
