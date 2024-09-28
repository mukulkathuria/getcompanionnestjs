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
          bookingend:{ gte: new Date().getTime() }
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
