import { Injectable, Logger } from '@nestjs/common';
import { refundAmountInputDto } from 'src/dto/admin.module.dto';
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
export class AdminTransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}
  private readonly logger = new Logger(AdminTransactionService.name);

  async getAllTransactionForBooking(
    bookingId: number,
  ): Promise<BookingTransactionReturnDto> {
    try {
      const transactions = await this.prismaService.transactionLedger.findMany({
        where: { bookingId },
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
        include: { transactionfromParty: { take: 5, orderBy: { createdAt: 'desc' } } },
      });
      return { data: userDetails.transactionfromParty };
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
      const previousbookings = await this.prismaService.transactionLedger.findUnique(
        { where: { txnId: userInput.txnid }, include: { Booking: true } },
      );
      if (!previousbookings) {
        return { error: { status: 404, message: 'Transaction not found' } };
      } else if (
        previousbookings.Booking.bookingstatus !== 'TRANSACTIONPENDING' ||
        previousbookings.status !== 'UNDERPROCESSED'
      ) {
        return { error: { status: 422, message: 'Invalid transaction' } };
      }
      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: userInput.undefinedmihpayid,
          metadata: data || {},
          settledAt: new Date(userInput.addedon).getTime(),
          Booking: {
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
      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.undefinedmihpayid,
          settledAt: new Date(userInput.addedon).getTime(),
          metadata: data ? { ...data, content: userInput.field9 } : {},
          Booking: {
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

  async onsuccessfullRefundPayment(
    userInput: refundAmountInputDto,
    userId: string,
  ) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      if (!userInput.bookingid || typeof userInput.bookingid !== 'number') {
        return { error: { status: 422, message: 'Booking id required' } };
      }
      const { data } = makePaymentdetailsjson(userInput);
      await this.prismaService.$transaction([
        this.prismaService.transactionLedger.create({
          data: {
            status: TransactionStatusEnum.REFUNDED,
            paymentGatewayTxnId: userInput.undefinedmihpayid,
            transactionType: 'REFUND_TO_USER',
            metadata: data || {},
            txnId: userInput.txnid,
            paymentMethod: data.paymentMethod,
            netAmount: Number(userInput.amount),
            grossAmount: Number(userInput.amount),
            settledAt: new Date(userInput.addedon).getTime(),
            ToPartyUser: { connect: { id: userId } },
            fromParty: 'ADMIN',
            toParty: 'USER',
            isSettled: true,
            Booking: { connect: { id: userInput.bookingid } },
          },
        }),
        this.prismaService.booking.update({
          where: {
            id: userInput.bookingid,
            bookingstatus: {
              in: ['CANCELLATIONAPPROVED', 'CANCELLEDREFUNDPENDING'],
            },
          },
          data: { bookingstatus: 'CANCELLED' },
        }),
      ]);
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedRefundPayment(userInput: refundAmountInputDto, userId: string) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      await this.prismaService.transactionLedger.create({
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.undefinedmihpayid,
          transactionType: 'REFUND_TO_USER',
          fromParty: 'ADMIN',
          toParty: 'USER',
          metadata: data || {},
          txnId: userInput.txnid,
          paymentMethod: 'CASH',
          grossAmount: Number(userInput.amount),
          netAmount: Number(userInput.amount),
          settledAt: new Date(userInput.addedon).getTime(),
          FromPartyUser: { connect: { id: userId } },
          Booking: { connect: { id: userInput.bookingid } },
        },
      });
      return { success: 'true' };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
