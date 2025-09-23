import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import {
  AdminNotificaionRoute,
  AdminNotificaionInnerRoute,
} from '../routes/admin.routes';
import { AdminNotificationServices } from './adminnotifications.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiControllerTag } from 'src/swagger/decorators';


@ApiControllerTag('admin-adminnotification')
@Controller(AdminNotificaionRoute)
export class AdminNotificationController {
  constructor(
    private readonly notificationservice: AdminNotificationServices,
  ) {}

  @UseGuards(AdminGuard)
  @Get(AdminNotificaionInnerRoute.getallnotifications)
  async getAllNotificationsController() {
    const { data, error } =
      await this.notificationservice.getAllNotifications();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
