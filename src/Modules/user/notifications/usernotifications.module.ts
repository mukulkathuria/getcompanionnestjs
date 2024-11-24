import { Module } from '@nestjs/common';
import { UserNotificationServices } from './notifications.service';
import { UserNotificationController } from './usernotifications.controller';

@Module({
  controllers: [UserNotificationController],
  providers: [UserNotificationServices],
})
export class UserNotificationModule {}
