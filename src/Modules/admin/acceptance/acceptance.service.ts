import { Injectable, Logger } from '@nestjs/common';
import {
  Notificationhours,
  Notificationreminders,
} from 'src/constants/common.constants';
import { NotificationFromModuleEnum } from 'src/dto/bookings.dto';
import { controllerReturnDto } from 'src/dto/common.dto';
import { PrismaService } from 'src/Services/prisma.service';
import notificationTemplate from 'src/templates/notification.template';
import { addHours, convertToDateTime } from 'src/utils/common.utils';
import * as dayjs from 'dayjs';

@Injectable()
export class AcceptanceService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async acceptBooking(bookingId: number): Promise<controllerReturnDto> {
    try {
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        include: {
          User: {
            select: {
              firstname: true,
              email: true,
              isCompanion: true,
              id: true,
            },
          },
        },
      });
      // eslint-disable-next-line
      const data = await this.prismaService.booking.update({
        where: { id: bookingId },
        data: { bookingstatus: 'ACCEPTED' },
      });
      const userdata = bookingDetails.User.find((l) => !l.isCompanion);
      const companiondata = bookingDetails.User.find((l) => l.isCompanion);
      const reminders = [];
      for (let i = 0; i < Notificationreminders.length; i += 1) {
        if (
          dayjs(Number(bookingDetails.bookingstart)).subtract(Notificationreminders[i]).valueOf() > Date.now()
        ) {
          reminders.push(
            `${dayjs(Number(bookingDetails.bookingstart)).subtract(12).valueOf()},${Notificationreminders[i]}`,
          );
        }
      }
      await this.prismaService.notification.create({
        data: {
          fromModule: NotificationFromModuleEnum.USER,
          expiry: addHours(Notificationhours.getrating),
          content: notificationTemplate({
            companion_name: companiondata.firstname,
            username: userdata.id,
            date_time: convertToDateTime(bookingDetails.bookingstart),
          }).bookingconfirmation,
          reminders,
          User: { connect: { id: userdata.id } },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
