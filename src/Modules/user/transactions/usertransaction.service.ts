import { Injectable, Logger } from '@nestjs/common';
import { BookingStatusEnum } from 'src/dto/bookings.dto';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
  initiatePaymentInputDto,
  payUTransactionDetailsDto,
  TransactionStatusEnum,
} from 'src/dto/transactions.dto';
import { PaymentService } from 'src/Services/payment.service';
import { PrismaService } from 'src/Services/prisma.service';
import { makePaymentdetailsjson } from 'src/utils/transactions.utils';
import {
  validateFailurePaymentStatus,
  validatehashGeneration,
  validatePaymentInitiation,
  validatePaymentStatus,
} from 'src/validations/transactions.validations';

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
      if (error) {
        return { error };
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

  async initiatePayment(userInput: initiatePaymentInputDto) {
    try {
      const { error } = validatePaymentInitiation(userInput);
      if (error) {
        return { error };
      }
      const { data, values } =
        await this.paymentService.initiatePayment(userInput);
      if (data) {
        const userDetails = await this.prismaService.user.findUnique({
          where: { email: userInput.email },
        });
        await this.prismaService.transactions.create({
          data: {
            txnid: values.txnid,
            User: { connect: { id: userDetails.id } },
            Bookings: { connect: { id: userInput.bookingId } },
            amount: Number(userInput.amount),
            payurefid: new Date().getTime().toString(),
            paymentmethod: 'CASH',
            transactionTime: new Date().getTime(),
          },
        });
        return { data };
      }
      return { error: { status: 422, message: 'Server Error' } };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onsuccessfullPayment(userInput: payUTransactionDetailsDto) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      const previousbookings = await this.prismaService.transactions.findUnique(
        { where: { txnid: userInput.txnid }, include: { Bookings: true } },
      );
      if (!previousbookings) {
        return { error: { status: 404, message: 'Transaction not found' } };
      } else if (
        previousbookings.Bookings.bookingstatus !== 'TRANSACTIONPENDING' ||
        previousbookings.status !== 'UNDERPROCESSED'
      ) {
        return { error: { status: 422, message: 'Invalid transaction' } };
      }
      await this.prismaService.transactions.update({
        where: { txnid: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          payurefid: userInput.undefinedmihpayid,
          paymentdetails: data || {},
          transactionTime: new Date(userInput.addedon).getTime(),
          Bookings: {
            update: { data: { bookingstatus: BookingStatusEnum.UNDERREVIEW } },
          },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedPayment(userInput: payUTransactionDetailsDto) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      await this.prismaService.transactions.update({
        where: { txnid: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          payurefid: userInput.undefinedmihpayid,
          transactionTime: new Date(userInput.addedon).getTime(),
          paymentdetails: data ? { ...data, content: userInput.field9 } : {},
          Bookings: {
            update: {
              data: { bookingstatus: BookingStatusEnum.TRANSACTIONPENDING },
            },
          },
        },
      });
      return { success: 'true' };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onsuccessfullPaymentofExtension(userInput: payUTransactionDetailsDto) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      const previousbookings = await this.prismaService.transactions.findUnique(
        { where: { txnid: userInput.txnid }, include: { Bookings: true } },
      );
      if (!previousbookings) {
        return { error: { status: 404, message: 'Transaction not found' } };
      }
      await this.prismaService.transactions.update({
        where: { txnid: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          payurefid: userInput.undefinedmihpayid,
          paymentdetails: data || {},
          transactionTime: new Date(userInput.addedon).getTime(),
          Bookings: {
            update: {
              data: {
                bookingstatus: BookingStatusEnum.ACCEPTED,
                bookingend: previousbookings.Bookings.extendedendtime,
                Sessions: {
                  update: {
                    where: { bookingid: previousbookings.bookingid },
                    data: {
                      isExtended: true,
                      sessionEndTime: previousbookings.Bookings.extendedendtime,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedPaymentofExtension(userInput: payUTransactionDetailsDto) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      await this.prismaService.transactions.update({
        where: { txnid: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          payurefid: userInput.undefinedmihpayid,
          transactionTime: new Date(userInput.addedon).getTime(),
          paymentdetails: data ? { ...data, content: userInput.field9 } : {},
          Bookings: {
            update: {
              data: { bookingstatus: BookingStatusEnum.UNDEREXTENSION },
            },
          },
        },
      });
      return { success: 'true' };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
