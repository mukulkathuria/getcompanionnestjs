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
        include: { transactiontoParty: { take: 5, orderBy: { createdAt: 'desc' } } },
      });
      return { data: userDetails.transactiontoParty };
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
        await this.prismaService.transactionLedger.create({
          data: {
            txnId: values.txnid,
            FromPartyUser: { connect: { id: userDetails.id } },
            Booking: { connect: { id: userInput.bookingId } },
            netAmount: Number(userInput.amount) * 0.05 + Number(userInput.amount),
            grossAmount: Number(userInput.amount),
            taxAmount: Number(userInput.amount) * 0.05,
            status: TransactionStatusEnum.UNDERPROCESSED,
            toParty: 'ADMIN',
            fromParty: 'USER',
            transactionType: 'BOOKING_PAYMENT',
            paymentGatewayTxnId: new Date().getTime().toString(),
            paymentMethod: 'CASH',
            settledAt: new Date().getTime(),
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
          paymentMethod: data.paymentMethod,
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

  async onsuccessfullPaymentofExtension(userInput: payUTransactionDetailsDto) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      const { data } = makePaymentdetailsjson(userInput);
      const previousbookings = await this.prismaService.transactionLedger.findUnique(
        {
          where: { txnId: userInput.txnid },
          include: {
            Booking: { include: { Sessions: true, statusHistory: true } },
          },
        },
      );
      if (!previousbookings) {
        return { error: { status: 404, message: 'Transaction not found' } };
      }
      const bookingendTime =
        previousbookings.Booking.Sessions[
          previousbookings.Booking.Sessions.length
        ].sessionEndTime;
      const extentedBooking = previousbookings.Booking.statusHistory.find(
        (l) => l.actionType === 'EXTENDED',
      );
      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: userInput.undefinedmihpayid,
          metadata: data || {},
          paymentMethod: data.paymentMethod,
          settledAt: new Date(userInput.addedon).getTime(),
          Booking: {
            update: {
              data: {
                bookingstatus: BookingStatusEnum.ACCEPTED,
                bookingend: bookingendTime,
                finalRate:
                  previousbookings.Booking.finalRate +
                  Number(userInput.amount),
                Sessions: {
                  create: {
                    isExtended: true,
                    sessionStartTime: Date.now(),
                    sessionEndTime: bookingendTime,
                  },
                },
                statusHistory: {
                  update: {
                    where: { id: extentedBooking.id },
                    data: {
                      actionType: 'EXTENDED',
                      previousStatus: 'ACCEPTED',
                      comment: 'Extension payment successful',
                      newStatus: 'ACCEPTED',
                      actionPerformedBy: 'USER',
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
      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.undefinedmihpayid,
          settledAt: new Date(userInput.addedon).getTime(),
          metadata: data ? { ...data, content: userInput.field9 } : {},
          Booking: {
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
