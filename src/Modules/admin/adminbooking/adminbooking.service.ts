import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { filterUnderreviewBooking } from 'src/utils/admin.booking.utils';

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
      });
      const filtereddata = filterUnderreviewBooking(data);
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
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        include: {
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
        },
      });
      return { data };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
