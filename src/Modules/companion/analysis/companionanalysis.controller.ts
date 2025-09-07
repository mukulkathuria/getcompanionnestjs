import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { CompanionAnalysisInnerRoutes } from '../routes/companion.routes';
import { CompanionAnalysisService } from './companionaalysis.service';

@Controller(CompanionAnalysisInnerRoutes.baseUrl)
export class CompanionAnalysisController {
  constructor(
    private readonly companionanalysisservice: CompanionAnalysisService,
  ) {}

  @Get(CompanionAnalysisInnerRoutes.companionoverallanalysis)
  async getCompanionOverallAnalysis(@Query('companionId') companionId: string) {
    const { data, error } =
      await this.companionanalysisservice.getCompanionOverallAnalysis(
        companionId,
      );
    if (data) {
      return { data };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
