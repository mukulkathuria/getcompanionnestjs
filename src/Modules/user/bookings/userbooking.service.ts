import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Notificationhours } from 'src/constants/common.constants';
import {
  BookingDurationUnitEnum,
  cancelBookingInputDto,
  NotificationFromModuleEnum,
  userBookingBodyDto,
  UserBookingReturnDto,
} from 'src/dto/bookings.dto';
import { NodeMailerService } from 'src/Services/nodemailer.service';
import { PrismaService } from 'src/Services/prisma.service';
import emailTemplate from 'src/templates/email.template';
import notificationTemplate from 'src/templates/notification.template';
import { filterSlotAvailability, getFinalRate } from 'src/utils/booking.utils';
import { addHours, createOTP } from 'src/utils/common.utils';
import { isUserBookingValid } from 'src/validations/booking.validation';

@Injectable()
export class UserBookingsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
  ) {}
  private readonly logger = new Logger(UserBookingsService.name);

  async getAllBookingsForUser(userId: string): Promise<UserBookingReturnDto> {
    try {
      const data = await this.prismaService.booking.findMany({
        where: { bookingstart: { gt: Date.now() }, bookingstatus: 'ACCEPTED' },
        include: { User: { where: { id: userId } } },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getpreviousBookingsForUser(): Promise<UserBookingReturnDto> {
    try {
      const data = await this.prismaService.booking.findMany({
        where: { bookingend: { lte: Date.now() } },
        include: { User: { where: { id: 'ad' } } },
        orderBy: { bookingend: 'desc' },
        take: 5,
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async bookaCompanion(bookingDetails: userBookingBodyDto) {
    try {
      const { error } = isUserBookingValid(bookingDetails);
      if (error) {
        return { error };
      }
      const hrmin =
        bookingDetails.bookingdurationUnit === BookingDurationUnitEnum.HOUR
          ? 'hour'
          : 'minute';
      const endDate = dayjs(bookingDetails.bookingdate)
        .add(bookingDetails.bookingduration, hrmin)
        .toDate()
        .getTime();
      const isSlotAvailable = await this.prismaService.user.findMany({
        where: { id: bookingDetails.companionId, isCompanion: true },
        include: {
          Booking: {
            where: {
              bookingstart: {
                lte: dayjs(bookingDetails.bookingdate).toDate().getTime(),
              },
              bookingend: {
                gt: dayjs(bookingDetails.bookingdate)
                  .add(1, 'hour')
                  .toDate()
                  .getTime(),
              },
            },
          },
          Companion: true,
        },
      });
      if (isSlotAvailable[0].Booking.length) {
        return { error: { status: 422, message: 'Slot not available' } };
      }
      const rates = {
        bookingrate: isSlotAvailable[0].Companion[0].bookingrate,
        finalRate: getFinalRate(
          bookingDetails,
          isSlotAvailable[0].Companion[0],
        ),
      };
      // eslint-disable-next-line
      const data = await this.prismaService.booking.create({
        data: {
          User: {
            connect: [
              { id: bookingDetails.userId },
              { id: bookingDetails.companionId },
            ],
          },
          bookingduration: bookingDetails.bookingduration,
          bookingstart: dayjs(bookingDetails.bookingdate).toDate().getTime(),
          bookingend: endDate,
          OTP: createOTP(),
          bookingdurationUnit: bookingDetails.bookingdurationUnit,
          Meetinglocation: {
            create: { ...bookingDetails.bookinglocation, basefrom: 'BOOKING' },
          },
          ...rates,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async checkBookedSlotsforCompanion(companionId: string) {
    try {
      const userdata = await this.prismaService.booking.findMany({
        where: { bookingend: { lt: Date.now() } },
        include: { User: { where: { id: companionId, isCompanion: true } } },
      });
      const filtereddata = filterSlotAvailability(userdata);
      return { data: filtereddata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async cancelBooking(input: cancelBookingInputDto) {
    try {
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id: input.bookingid },
        include: { User: true },
      });
      const cancelledByCompanion = bookingDetails.User.find(
        (l) => l.id === input.userId,
      );
      if (cancelledByCompanion.isCompanion) {
        await this.prismaService.booking.update({
          where: { id: input.bookingid },
          data: { bookingstatus: 'UNDERCANCELLATION' },
        });
        return { success: 'Its under consideration. please contact admin' };
      }
      const timeofcancellation =
        bookingDetails.bookingstart - Date.now() / (1000 * 60 * 60);
      if (timeofcancellation < 0) {
        return {
          error: { status: 422, message: "You can't cancel past booking" },
        };
      }
      const userdata = bookingDetails.User.find((l) => !l.isCompanion);
      const companiondata = bookingDetails.User.find((l) => l.isCompanion);
      await this.prismaService.booking.update({
        where: { id: input.bookingid },
        data: { bookingstatus: 'CANCELLED' },
      });
      await this.prismaService.notification.create({
        data: {
          fromModule: NotificationFromModuleEnum.BOOKING,
          expiry: addHours(Notificationhours.cancellationbyuser),
          content: notificationTemplate({
            companion_name: companiondata.firstname,
          }).cancelationbyuser,
          User: { connect: { id: userdata.id } },
        },
      });
      const totalrefundamount = bookingDetails.finalRate * 0.7;
      const { usercancelbooking, refundprocess } = emailTemplate({
        username: userdata.firstname,
        companion_name: companiondata.firstname,
        refundamount: `₹${totalrefundamount}`,
      });

      if (timeofcancellation < 24) {
        this.nodemailerService
          .sendMail({
            from: process.env['BREVO_SENDER_EMAIL'],
            to: userdata.email,
            subject: usercancelbooking.subject,
            html: usercancelbooking.body,
          })
          .then(() => {
            this.logger.log(`Email sent to: ${userdata.email}`);
          });
      } else {
        this.nodemailerService
          .sendMail({
            from: process.env['BREVO_SENDER_EMAIL'],
            to: userdata.email,
            subject: refundprocess.subject,
            html: refundprocess.body,
          })
          .then(() => {
            this.logger.log(`Email sent to: ${userdata.email}`);
          });
        // cancel booking transaction pending
      }
      return { success: `Successfully cancelled the booking` };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
