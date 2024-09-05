import { Injectable, Logger } from '@nestjs/common';
import { UserBookingReturnDto } from 'src/dto/bookings.dto';
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
}
