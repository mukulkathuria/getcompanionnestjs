import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import {
  BookingDurationUnitEnum,
  userBookingBodyDto,
  UserBookingReturnDto,
} from 'src/dto/bookings.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { getFinalRate } from 'src/utils/booking.utils';
import { createOTP } from 'src/utils/common.utils';
import { isUserBookingValid } from 'src/validations/booking.validation';

@Injectable()
export class UserBookingsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserBookingsService.name);

  async getAllBookingsForUser(): Promise<UserBookingReturnDto> {
    try {
      const data = await this.prismaService.booking.findMany({
        where: { bookingstart: { gt: Date.now() } },
        include: { User: { where: { id: 'ad' } } },
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

  async checkBookedSlotsforCompanion() {
    try {
      const userdata = await this.prismaService.booking.findMany({
        where: { bookingend: { lt: Date.now() } },
        include: { User: { where: { id: 'abc', isCompanion: true } } },
      });
      return { data: userdata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async cancelBooking() {
    try {
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id: 1 },
        include: { User: true },
      });
      const cancelledByCompanion = bookingDetails.User.find(
        (l) => l.id === 'ab',
      );
      if (cancelledByCompanion.isCompanion) {
        console.log(
          'First send confirmation from admin then Need to send the mail to user for modification',
        );
      }
      const timeofcancellation =
        bookingDetails.bookingstart - Date.now() / (1000 * 60 * 60);
      if (timeofcancellation < 0) {
        return {
          error: { status: 422, message: "You can't cancel past booking" },
        };
      } else if (timeofcancellation < 24) {
        console.log('No refunded amount');
      } else {
        console.log('Refund some amount ');
      }

      const userdata = await this.prismaService.booking.findMany({
        where: { bookingend: { lt: Date.now() } },
        include: { User: { where: { id: 'abc', isCompanion: true } } },
      });
      return { data: userdata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
