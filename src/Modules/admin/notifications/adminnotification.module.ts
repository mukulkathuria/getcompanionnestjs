import { Module } from '@nestjs/common';
import { AdminNotificationController } from './adminnotification.controller';
import { AdminNotificationServices } from './adminnotifications.service';

Module({
  controllers: [AdminNotificationController],
  providers: [AdminNotificationServices],
});
export class AdminNotificationModule {}
