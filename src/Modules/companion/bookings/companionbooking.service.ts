import { Injectable, Logger } from '@nestjs/common';
import { bookingIdDto } from 'src/dto/bookings.dto';
import { AcceptanceService } from 'src/Modules/admin/acceptance/acceptance.service';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class CompanionBookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly acceptanceService: AcceptanceService,
  ) {}
  private readonly logger = new Logger(CompanionBookingService.name);

  async acceptBooking(bookingparams: bookingIdDto) {
    if (
      !bookingparams.bookingid ||
      typeof bookingparams.bookingid !== 'number'
    ) {
      return { error: { status: 422, message: 'bookingid is required' } };
    }
    return this.acceptanceService.acceptBooking(
      bookingparams.bookingid,
      'COMPANION',
    );
  }

  async rejectBooking(bookingparams: bookingIdDto) {
    if (
      !bookingparams.bookingid ||
      typeof bookingparams.bookingid !== 'number'
    ) {
      return { error: { status: 422, message: 'bookingid is required' } };
    }
    return this.acceptanceService.rejectBooking(
      bookingparams.bookingid,
      'COMPANION',
    );
  }

  async getcompanionBookingDetails(bookingparams: bookingIdDto) {
    try {
      if (
        !bookingparams.bookingid ||
        typeof bookingparams.bookingid !== 'number'
      ) {
        return { error: { status: 422, message: 'bookingid is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingparams.bookingid },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              Images: true,
              isCompanion: true,
            },
          },
          bookingstart: true,
          bookingend: true,
          bookingpurpose: true,
          Meetinglocation: true,
        },
      });
      if (!data) {
        return { error: { status: 404, message: '' } };
      }
      const value = {
        ...data,
        bookingstart: String(data.bookingstart),
        bookingend: String(data.bookingend),
        Meetinglocation: data.Meetinglocation.map((l) => ({
          address: l.googleformattedadress,
          lat: l.lat,
          lng: l.lng,
        })),
      };
      return { data: value };
    } catch (error) {
      this.logger.error(error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
