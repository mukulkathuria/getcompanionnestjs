import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AdminBookingService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async getAllAdminBookings() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: {
          bookingstatus: 'UNDERREVIEW',
          bookingend: { gte: Date.now() },
        },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              gender: true,
              isCompanion: true,
            },
          },
          Meetinglocation: { select: { city: true } },
          bookingstart: true,
          id: true
        },
      });
      const filtereddata = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      return { data: filtereddata };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getBookingDetails(bookingId: number) {
    try {
      if (!bookingId || typeof bookingId !== 'number') {
        return { error: { status: 422, message: 'Booking id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        select: {
          Meetinglocation: { select: { lat: true, lng: true, city: true } },
          User: {
            select: {
              firstname: true,
              lastname: true,
              age: true,
              Images: true,
              isCompanion: true,
            },
          },
          bookingstart: true,
          bookingrate: true,
          bookingend: true,
          bookingduration: true,
          bookingpurpose: true,
          finalRate: true,
          bookingstatus: true,
        },
      });
      if (!data) {
        return { error: { status: 404, message: 'Booking id not found' } };
      }
      const values = {
        ...data,
        bookingstart: String(data.bookingstart),
        bookingend: String(data.bookingend),
      };
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
