import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CompanionSettingInnerRoutes } from '../routes/companion.routes';
import { CompanionSettingService } from './companionsetting.service';
import { CompanionSettingDto } from 'src/dto/companionsetting.dto';
import { ApiControllerTag } from 'src/swagger/decorators';

@ApiControllerTag('companion-companionsetting')
@Controller(CompanionSettingInnerRoutes.baseUrl)
export class CompanionSettingController {
  constructor(
    private readonly companionSettingService: CompanionSettingService,
  ) {}

  @Get(CompanionSettingInnerRoutes.companiongetsetting)
  async getCompanionSetting(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      return new HttpException(TokenError, HttpStatus.BAD_REQUEST);
    }
    const { data, error } =
      await this.companionSettingService.getCompanionSetting(Tokendata.userId);
    if (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
    }
    return data;
  }

  @Post(CompanionSettingInnerRoutes.companionupdatesetting)
  async updateCompanionSetting(
    @Req() req: Request,
    @Body() companionSetting: CompanionSettingDto,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      return new HttpException(TokenError, HttpStatus.BAD_REQUEST);
    }
    const { success, error } =
      await this.companionSettingService.updateCompanionSetting(
        Tokendata.userId,
        companionSetting,
      );
    if (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }
}
