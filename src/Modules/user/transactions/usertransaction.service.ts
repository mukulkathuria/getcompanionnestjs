import { Injectable, Logger } from '@nestjs/common';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
} from 'src/dto/transactions.dto';
import { PaymentService } from 'src/Services/payment.service';
import { PrismaService } from 'src/Services/prisma.service';
import { validatehashGeneration } from 'src/validations/transactions.validations';

@Injectable()
export class UserTransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}
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

  async getPreviousTransactions(userId: string) {
    try {
      const userDetails = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { Transactions: { take: 5, orderBy: { createdAt: 'desc' } } },
      });
      return { data: userDetails.Transactions };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getHashforTransaction(userInput: getHashInputDto) {
    try {
      const { error } = validatehashGeneration(userInput);
      if(error){
        return { error }
      } 
      const { data } = await this.paymentService.generateHash(userInput);
      if (data) {
        return { data };
      }
      return { error: { status: 422, message: 'Server Error' } };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async initiatePayment() {
    try {
      const { data } = await this.paymentService.makeTransaction();
      // console.log(data, error);
      if (data) {
        return { data };
      }
      return { error: { status: 422, message: 'Server Error' } };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
