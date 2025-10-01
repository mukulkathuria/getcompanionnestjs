import {
  Controller,
  Get,
  HttpException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompanionAnalysisInnerRoutes } from '../routes/companion.routes';
import { CompanionAnalysisService } from './companionanalysis.service';
import { ApiControllerTag } from 'src/swagger/decorators';
import { AuthGuard } from 'src/guards/jwt.guard';
import { pageNoQueryDto } from 'src/dto/bookings.dto';

@ApiControllerTag('companion-companionanalysis')
@Controller(CompanionAnalysisInnerRoutes.baseUrl)
export class CompanionAnalysisController {
  constructor(
    private readonly companionanalysisservice: CompanionAnalysisService,
  ) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get(CompanionAnalysisInnerRoutes.getallcompanioncompletedearnings)
  async getallcompanioncompletedearningscontroller(
    @Req() req: Request,
    @Query() pageparams: pageNoQueryDto,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { data, error } =
        await this.companionanalysisservice.getallcompanioncompletedearnings(
          Tokendata.userId,
          pageparams,
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

  @UseGuards(AuthGuard)
  @Get(CompanionAnalysisInnerRoutes.getallcompanionpendingearnings)
  async getallcompanionpendingearningscontroller(
    @Req() req: Request,
    @Query() pageparams: pageNoQueryDto,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { data, error } =
        await this.companionanalysisservice.getallcompanionpendingearnings(
          Tokendata.userId,
          pageparams,
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
