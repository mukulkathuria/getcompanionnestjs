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
        take: 5
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
      console.log(error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
