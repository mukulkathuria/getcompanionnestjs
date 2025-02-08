import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  UsernotificationInnerRoute,
  UserNotificationRoute,
} from '../routes/user.routes';
import { UserNotificationServices } from './notifications.service';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller(UserNotificationRoute)
export class UserNotificationController {
  constructor(private readonly notificationservice: UserNotificationServices) {}

  @UseGuards(AuthGuard)
  @Get(UsernotificationInnerRoute.getusernotifications)
  @HttpCode(200)
  async getUserNotificationController(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { data, error } =
        await this.notificationservice.getNotificationforUser(Tokendata.userId);
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException('Server Error', 500);
    }
  }
}
