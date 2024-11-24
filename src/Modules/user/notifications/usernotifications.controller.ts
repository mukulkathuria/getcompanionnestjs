import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Query,
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
  async getUserNotificationController(@Query() userId: string) {
    const { data, error } =
      await this.notificationservice.getNotificationforUser(userId);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
