import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookingStatusEnum } from 'src/dto/bookings.dto';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
  initiatePaymentInputDto,
  RazorpayVerifyPaymentDto,
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
    } catch (error: any) {
      this.logger.error('getAllTransactionForBooking', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getPreviousTransactions(userId: number) {
    try {
      const userDetails = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          transactiontoParty: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      });
      return { data: userDetails.transactiontoParty };
    } catch (error: any) {
      this.logger.error('getPreviousTransactions', error?.message || error);
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
    } catch (error: any) {
      this.logger.error('getHashforTransaction', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async initiatePayment(userInput: initiatePaymentInputDto) {
    try {
      const { error } = validatePaymentInitiation(userInput);
      if (error) {
        return { error };
      }

      const {
        data,
        values,
        error: payError,
      } = await this.paymentService.initiatePayment(userInput);

      if (payError) {
        return { error: payError };
      }

      if (!data || !values) {
        return { error: { status: 422, message: 'Server Error' } };
      }

      const userDetails = await this.prismaService.user.findUnique({
        where: { email: userInput.email },
      });

      if (!userDetails) {
        return { error: { status: 404, message: 'User not found' } };
      }

      const bookingdata = await this.prismaService.booking.findUnique({
        where: { id: userInput.bookingId },
      });
      await this.prismaService.transactionLedger.create({
        data: {
          txnId: values.txnid,
          FromPartyUser: { connect: { id: userDetails.id } },
          Booking: { connect: { id: userInput.bookingId } },
          netAmount: Number(bookingdata.finalRate),
          grossAmount: Number(bookingdata.finalRate),
          taxAmount: Number(bookingdata.finalRate) * 0.05,
          platformFee: Number(bookingdata.finalRate) * 0.1,
          status: TransactionStatusEnum.UNDERPROCESSED,
          toParty: 'ADMIN',
          fromParty: 'USER',
          transactionType: 'BOOKING_PAYMENT',
          paymentGatewayTxnId: values.orderId,
          paymentMethod: 'PENDING',
          settledAt: new Date().getTime(),
        },
      });

      return { data };
    } catch (error: any) {
      this.logger.error('initiatePayment', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
  async onsuccessfullPayment(userInput: RazorpayVerifyPaymentDto) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      const isValidSignature =
        this.paymentService.verifyPaymentSignature(userInput);
      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Razorpay signature for payment ${userInput.razorpay_payment_id}`,
        );
        return { error: { status: 403, message: 'Invalid payment signature' } };
      }
      const previousTransaction =
        await this.prismaService.transactionLedger.findUnique({
          where: { txnId: userInput.txnid },
          include: { Booking: true },
        });

      if (!previousTransaction) {
        return { error: { status: 404, message: 'Transaction not found' } };
      }

      if (
        previousTransaction.Booking.bookingstatus !== 'TRANSACTIONPENDING' ||
        previousTransaction.status !== 'UNDERPROCESSED'
      ) {
        return { error: { status: 422, message: 'Invalid transaction' } };
      }

      const { data: razorpayPayment, error: fetchError } =
        await this.paymentService.getPaymentDetails(
          userInput.razorpay_payment_id,
        );

      if (fetchError || !razorpayPayment) {
        this.logger.error(
          `Failed to fetch payment details for ${userInput.razorpay_payment_id}`,
          fetchError,
        );
        return {
          error: fetchError ?? {
            status: 500,
            message: 'Failed to fetch payment details',
          },
        };
      }
      const { data: paymentDetailsJson } =
        makePaymentdetailsjson(razorpayPayment);

      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: userInput.razorpay_payment_id,
          metadata:
            (paymentDetailsJson as unknown as Prisma.InputJsonValue) ?? {},
          paymentMethod: paymentDetailsJson?.paymentMethod ?? 'UNKNOWN',
          paymentGatewayResponse: razorpayPayment as { [key: string]: any },
          settledAt: razorpayPayment.created_at
            ? razorpayPayment.created_at * 1000 // Razorpay returns UNIX seconds
            : new Date().getTime(),
          Booking: {
            update: {
              data: { bookingstatus: BookingStatusEnum.UNDERREVIEW },
            },
          },
        },
      });

      return { success: true };
    } catch (error: any) {
      this.logger.error('onsuccessfullPayment', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedPayment(
    userInput: RazorpayVerifyPaymentDto & {
      error_code?: string;
      error_description?: string;
    },
  ) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };

      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.razorpay_payment_id,
          settledAt: new Date().getTime(),
          metadata: {
            error_code: userInput.error_code ?? null,
            error_description: userInput.error_description ?? null,
            order_id: userInput.razorpay_order_id ?? null,
          },
          Booking: {
            update: {
              data: { bookingstatus: BookingStatusEnum.TRANSACTIONPENDING },
            },
          },
        },
      });

      return { success: true };
    } catch (error: any) {
      this.logger.error('onFailedPayment', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onsuccessfullPaymentofExtension(userInput: RazorpayVerifyPaymentDto) {
    try {
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };
      const isValidSignature =
        this.paymentService.verifyPaymentSignature(userInput);
      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Razorpay signature for extension payment ${userInput.razorpay_payment_id}`,
        );
        return { error: { status: 403, message: 'Invalid payment signature' } };
      }
      const previousTransaction =
        await this.prismaService.transactionLedger.findUnique({
          where: { txnId: userInput.txnid },
          include: {
            Booking: { include: { Sessions: true, statusHistory: true } },
          },
        });

      if (!previousTransaction) {
        return { error: { status: 404, message: 'Transaction not found' } };
      }

      const extentedBooking = previousTransaction.Booking.statusHistory.find(
        (l) => l.actionType === 'EXTENDED',
      );

      if (!extentedBooking) {
        return {
          error: { status: 422, message: 'Extension record not found' },
        };
      }
      const { data: razorpayPayment, error: fetchError } =
        await this.paymentService.getPaymentDetails(
          userInput.razorpay_payment_id,
        );

      if (fetchError || !razorpayPayment) {
        this.logger.error(
          `Failed to fetch extension payment details for ${userInput.razorpay_payment_id}`,
          fetchError,
        );
        return {
          error: fetchError ?? {
            status: 500,
            message: 'Failed to fetch payment details',
          },
        };
      }
      const { data: paymentDetailsJson } =
        makePaymentdetailsjson(razorpayPayment);

      const amountPaidInRupees = razorpayPayment.amount / 100;

      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: userInput.razorpay_payment_id,
          metadata:
            (paymentDetailsJson as unknown as Prisma.InputJsonValue) ?? {},
          paymentMethod: paymentDetailsJson?.paymentMethod ?? 'UNKNOWN',
          paymentGatewayResponse: razorpayPayment as { [key: string]: any },
          settledAt: razorpayPayment.created_at
            ? razorpayPayment.created_at * 1000
            : new Date().getTime(),
          Booking: {
            update: {
              data: {
                bookingstatus: BookingStatusEnum.ACCEPTED,
                bookingend: extentedBooking.extendedendtime,
                finalRate:
                  previousTransaction.Booking.finalRate + amountPaidInRupees,
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
                Sessions: {
                  create: {
                    isExtended: true,
                    sessionStartTime: previousTransaction.Booking.bookingend,
                    sessionEndTime: extentedBooking.extendedendtime,
                  },
                },
              },
            },
          },
        },
      });

      return { success: true };
    } catch (error: any) {
      this.logger.error('onsuccessfullPaymentofExtension', error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedPaymentofExtension(
    userInput: RazorpayVerifyPaymentDto & {
      error_code?: string;
      error_description?: string;
    },
  ) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };

      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.razorpay_payment_id,
          settledAt: new Date().getTime(),
          metadata: {
            error_code: userInput.error_code ?? null,
            error_description: userInput.error_description ?? null,
            order_id: userInput.razorpay_order_id ?? null,
          },
          Booking: {
            update: {
              data: { bookingstatus: BookingStatusEnum.UNDEREXTENSION },
            },
          },
        },
      });

      return { success: true };
    } catch (error: any) {
      this.logger.error('onFailedPaymentofExtension', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
