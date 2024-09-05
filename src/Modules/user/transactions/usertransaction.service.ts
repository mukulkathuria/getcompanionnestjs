import { Injectable, Logger } from '@nestjs/common';
import { BookingTransactionReturnDto } from 'src/dto/transactions.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserTransactionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserTransactionService.name);

  async getAllTransactionForBooking(
    bookingid: number,
  ): Promise<BookingTransactionReturnDto> {
    try {
      const transactions = await this.prismaService.transactions.findMany({
        where: { bookingid: 1 },
      });
      return { data: transactions };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
