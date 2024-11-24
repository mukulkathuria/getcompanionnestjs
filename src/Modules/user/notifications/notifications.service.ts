import { Injectable, Logger } from '@nestjs/common';
import { notification } from '@prisma/client';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserNotificationServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserNotificationServices.name);

  async getNotificationforUser(userId: string) {
    try {
      const data = await this.prismaService.notification.findMany({
        where: {
          expiry: { lt: Date.now() },
          OR: [{ isGobal: true }, { foruser: userId }],
        },
      });
      const finalResults: notification[] = [];
      for (let i = 0; i <= data.length; i += 1) {
        if (data[i].reminders.length) {
          const reminders = data[i].reminders;
          for (let j = 0; j < reminders.length; j += 1) {
            const timer = Number(reminders[j].split(',')[0]);
            if (timer > Date.now()) {
              finalResults.push({
                ...data[i],
                content: `You have just ${reminders[j].split(',')[1]} left for your meeting`,
              });
            }
          }
        } else {
          finalResults.push(data[i]);
        }
      }
      return { data: finalResults };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
