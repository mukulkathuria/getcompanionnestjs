import { Controller, Get, HttpException, Req } from '@nestjs/common';
import { CompanionAnalysisInnerRoutes } from '../routes/companion.routes';
import { CompanionAnalysisService } from './companionaalysis.service';

@Controller(CompanionAnalysisInnerRoutes.baseUrl)
export class CompanionAnalysisController {
  constructor(
    private readonly companionanalysisservice: CompanionAnalysisService,
  ) {}

  @Get(CompanionAnalysisInnerRoutes.companionoverallanalysis)
  async getCompanionOverallAnalysis(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { data, error } =
        await this.companionanalysisservice.getCompanionOverallAnalysis(
          Tokendata.userId,
        );
      if (data) {
        return { data };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError, 403);
    }
  }
}
