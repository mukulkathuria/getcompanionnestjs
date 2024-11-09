import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserSessionInnerRoute, UserSessionRoute } from '../routes/user.routes';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserSessionService } from './usersession.service';
import {
  SessionExtendBodyParamsDto,
  SessionIdBodyParamsDto,
  StartBookingBodyparamsDto,
} from 'src/dto/usersession.dto';

@Controller(UserSessionRoute)
export class UserSessionController {
  constructor(private readonly usersessionservice: UserSessionService) {}

  @UseGuards(AuthGuard)
  @Post(UserSessionInnerRoute.startsession)
  async startUserSessionController(@Body() session: StartBookingBodyparamsDto) {
    const { data, error } = await this.usersessionservice.startSession(session);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserSessionInnerRoute.endsession)
  async endUserSessionController(@Body() session: SessionIdBodyParamsDto) {
    const { data, error } = await this.usersessionservice.endSession(session);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserSessionInnerRoute.extendsession)
  async extendUserSessionController(
    @Body() session: SessionExtendBodyParamsDto,
  ) {
    const { data, error } =
      await this.usersessionservice.extendSession(session);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
