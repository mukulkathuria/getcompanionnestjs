import {
  Controller,
  Get,
  HttpException,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanionDashboardInnerRoutes } from '../routes/companion.routes';
import { CompanionDashboardService } from './dashboard.service';
import { BigIntSerializerInterceptor } from 'src/interceptors/bigint-serializer.interceptor';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller(CompanionDashboardInnerRoutes.baseUrl)
@UseInterceptors(BigIntSerializerInterceptor)
export class CompanionDashboardController {
  constructor(
    private readonly companionDashboardService: CompanionDashboardService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(CompanionDashboardInnerRoutes.companiondashboard)
  async getCompanionDashboard(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { data, error } =
        await this.companionDashboardService.getCompanionDashboard(
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
