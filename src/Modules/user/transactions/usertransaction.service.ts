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
        where: { bookingid },
      });
      return { data: transactions };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getPreviousTransactions() {
    try {
      const userDetails = await this.prismaService.user.findUnique({
        where: { id: 'abc' },
        include: { Transactions: { take: 5, orderBy: { createdAt: 'desc' } } },
      });
      return { data: userDetails.Transactions };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
