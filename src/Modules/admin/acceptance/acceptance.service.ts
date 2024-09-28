import { Injectable, Logger } from '@nestjs/common';
import { controllerReturnDto } from 'src/dto/common.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AcceptanceService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async acceptBooking(bookingId: number): Promise<controllerReturnDto> {
    try {
      const data = await this.prismaService.booking.update({
        where: { id: bookingId },
        data: { bookingstatus: 'ACCEPTED' },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
