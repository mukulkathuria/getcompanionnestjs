import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { userBookingBodyDto, UserBookingReturnDto } from 'src/dto/bookings.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserBookingsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserBookingsService.name);

  async getAllBookingsForUser(): Promise<UserBookingReturnDto> {
    try {
      const data = await this.prismaService.booking.findMany({
        include: { User: { where: { id: 'ad' } } },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async bookaCompanion(bookingDetails: userBookingBodyDto) {
    try {
      if (dayjs(bookingDetails.bookingdate).isBefore(dayjs())) {
        return {
          error: { status: 422, message: "You can't book on past date" },
        };
      }
      const hrmin =
        bookingDetails.bookingdurationUnit === 'PERHOUR' ? 'hour' : 'minute';
      const endDate = dayjs(bookingDetails.bookingdate)
        .add(bookingDetails.bookingduration, hrmin)
        .toDate();
      const isSlotAvailable = await this.prismaService.user.findMany({
        where: { id: bookingDetails.companionId, isCompanion: true },
        include: {
          Booking: {
            where: {
              bookingstart: { lte: bookingDetails.bookingdate },
              bookingend: { gte: endDate },
            },
          },
        },
      });
      if (isSlotAvailable[0].Booking.length) {
        return { error: { status: 422, message: 'Slot not available' } };
      }
      const data = await this.prismaService.booking.create({
        data: {
          User: {
            connect: [
              { id: bookingDetails.userId },
              { id: bookingDetails.companionId },
            ],
          },
          bookingduration: bookingDetails.bookingduration,
          bookingstart: bookingDetails.bookingdate,
          bookingend: endDate,
          bookingdurationUnit: bookingDetails.bookingdurationUnit,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
