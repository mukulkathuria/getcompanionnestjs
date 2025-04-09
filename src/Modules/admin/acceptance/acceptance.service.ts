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
import { statusUpdateInputDto } from 'src/dto/admin.module.dto';
import { validateRequestInput } from 'src/validations/companionrequest.validation';
import emailTemplate from 'src/templates/email.template';
import { NodeMailerService } from 'src/Services/nodemailer.service';

@Injectable()
export class AcceptanceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
  ) {}
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
          Meetinglocation: {
            select: { googleformattedadress: true, googleloc: true },
          },
        },
      });
      if (!bookingDetails) {
        return { error: { status: 404, message: 'Bookings not found' } };
      } else if (
        bookingDetails &&
        bookingDetails?.bookingstatus !== 'UNDERREVIEW'
      ) {
        return { error: { status: 404, message: 'Bookings Already Accepted' } };
      }
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
          dayjs(Number(bookingDetails.bookingstart))
            .subtract(Notificationreminders[i], 'hours')
            .valueOf() > Date.now()
        ) {
          reminders.push(
            `${dayjs(Number(bookingDetails.bookingstart)).subtract(Notificationreminders[i]).valueOf()},${Notificationreminders[i]}`,
          );
        }
      }
      await this.prismaService.notification.create({
        data: {
          fromModule: NotificationFromModuleEnum.USER,
          expiry: addHours(Notificationhours.getrating),
          content: notificationTemplate({
            companion_name: companiondata.firstname,
            username: companiondata.firstname,
            date_time: convertToDateTime(bookingDetails.bookingstart),
          }).bookingconfirmation,
          reminders,
          User: { connect: { id: userdata.id } },
        },
      });
      const {
        bookingconfirmation: { subject, body },
      } = emailTemplate({
        username: userdata.firstname,
        companion_name: companiondata.firstname,
        date_time: convertToDateTime(bookingDetails.bookingstart),
        meetingpoint: bookingDetails.Meetinglocation[0].googleformattedadress,
        otp: String(bookingDetails.OTP),
      });
      const { error: mailerror } = await this.nodemailerService.sendMail({
        to: userdata.email,
        html: body,
        subject,
      });
      if (mailerror) {
        console.log('Error on send email to user');
      }
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async updateCancellationRequestStatus(bookingInput: statusUpdateInputDto) {
    try {
      const id = Number(bookingInput.id);
      if (!id || typeof id !== 'number') {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const { error } = validateRequestInput(bookingInput, 'Booking');
      if (error) {
        return { error };
      }
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id },
      });
      if (!bookingDetails) {
        return { error: { status: 404, message: 'Bookings not found' } };
      }
      await this.prismaService.booking.update({
        where: { id },
        data: {
          bookingstatus: bookingInput.approve
            ? 'CANCELLATIONAPPROVED'
            : 'ACCEPTED',
          refundamount: bookingDetails.finalRate,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async rejectBooking(bookingId: number): Promise<controllerReturnDto> {
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
      if (!bookingDetails) {
        return { error: { status: 404, message: 'Bookings not found' } };
      } else if (
        bookingDetails &&
        bookingDetails?.bookingstatus !== 'UNDERREVIEW'
      ) {
        return { error: { status: 404, message: 'Bookings Already Accepted' } };
      }
      await this.prismaService.booking.update({
        where: { id: bookingId },
        data: {
          bookingstatus: 'REJECTED',
          refundamount: bookingDetails.finalRate,
        },
      });
      const userdata = bookingDetails.User.find((l) => !l.isCompanion);
      const companiondata = bookingDetails.User.find((l) => l.isCompanion);

      await this.prismaService.notification.create({
        data: {
          fromModule: NotificationFromModuleEnum.USER,
          expiry: addHours(Notificationhours.getrating),
          content: notificationTemplate({
            companion_name: companiondata.firstname,
          }).cancellationbyadmin,
          User: { connect: { id: userdata.id } },
        },
      });
      const {
        rejectionBooking: { subject, body },
      } = emailTemplate({
        username: userdata.firstname,
        refundamount: String(
          bookingDetails.finalRate - bookingDetails.finalRate * 0.18,
        ),
      });
      const { error: mailerror } = await this.nodemailerService.sendMail({
        to: userdata.email,
        html: body,
        subject,
      });
      if (mailerror) {
        console.log('Error on send email to user');
      }
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
