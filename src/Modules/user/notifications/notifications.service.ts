import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserNotificationServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserNotificationServices.name);

  async getNotificationforUser(userId: string) {
    try {
      const data = await this.prismaService.notification.findMany({
        where: {
          expiry: { gt: Date.now() },
          OR: [{ isGobal: true }, { foruser: userId }],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          foruser: true,
          isGobal: true,
          reminders: true,
          fromModule: true,
          moduleotherDetails: true,
          contentforadmin: true,
          createdAt: true,
        },
      });
      const finalResults = [];
      for (let i = 0; i <= data.length; i += 1) {
        if (data[i]?.reminders?.length) {
          const reminders = data[i]?.reminders?.filter((l) => l);
          for (let j = 0; j < reminders.length; j += 1) {
            const timer = Number(reminders[j].split(',')[0]);
            if (timer < Date.now()) {
              finalResults.push({
                ...data[i],
                content: `You have just ${reminders[j].split(',')[1]} left for your meeting`,
              });
            }
          }
        }
        finalResults.push(data[i]);
      }
      return { data: finalResults.filter((l) => l) };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async clearNotification(notificationId: number) {
    try {
      if (!notificationId || typeof notificationId !== 'number') {
        return {
          error: { status: 422, message: 'Notification id is required' },
        };
      }
      await this.prismaService.notification.update({
        where: { id: notificationId },
        data: { expiry: Date.now() },
      });
      return { success: true, message: 'Notification cleared' };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
