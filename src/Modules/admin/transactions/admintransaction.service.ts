import { Injectable, Logger } from '@nestjs/common';
import { refundAmountInputDto } from 'src/dto/admin.module.dto';
import {
  BookingStatusEnum,
  pageNoQueryDto,
  updatependingtransactionforcompanionDto,
} from 'src/dto/bookings.dto';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
  initiatePaymentInputDto,
  RazorpayPaymentDetailsDto,
  RazorpayVerifyPaymentDto,
  TransactionStatusEnum,
} from 'src/dto/transactions.dto';
import { PaymentService } from 'src/Services/payment.service';
import { PrismaService } from 'src/Services/prisma.service';
import { makePaymentdetailsjson } from 'src/utils/transactions.utils';
import {
  validateadmincompaniontransaction,
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
    } catch (error:any) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getAllPendingTransactionsforCompanion(params: pageNoQueryDto) {
    try {
      const transactions = await this.prismaService.transactionLedger.findMany({
        where: {
          status: TransactionStatusEnum.UNDERPROCESSED,
          toParty: 'COMPANION',
        },
        include: { ToPartyUser: true },
      });
      const pageNo = Number(params.pageNo) || 1;
      const data = transactions.map((t) => {
        const vals = {
          ...t,
        };
        delete vals.ToPartyUser;
        delete vals.settledAt;
        delete vals.createdAt;
        delete vals.updatedAt;
        return vals;
      });
      const allcompanions = transactions.map((t) => ({
        id: t.id,
        name: t.ToPartyUser?.firstname,
        images: t.ToPartyUser.Images,
        email: t.ToPartyUser?.email,
      }));
      const finalvalue = {
        totalPages: Math.ceil(data.length / 5),
        limit: 5,
        currentPage: pageNo,
        pendingtransactions: data.slice((pageNo - 1) * 5, pageNo * 5),
        all_companions: allcompanions,
      };
      return { data: finalvalue };
    } catch (error:any) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getPreviousTransactions(userId: string) {
    try {
      const userDetails = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          transactionfromParty: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      });
      return { data: userDetails.transactionfromParty };
    } catch (error:any) {
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
    } catch (error:any) {
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
    } catch (error:any) {
      this.logger.debug(error?.message || error);
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
      const previousbookings =
        await this.prismaService.transactionLedger.findUnique({
          where: { txnId: userInput.txnid },
          include: { Booking: true },
        });
      if (!previousbookings) {
        return { error: { status: 404, message: 'Transaction not found' } };
      } else if (
        previousbookings.Booking.bookingstatus !== 'TRANSACTIONPENDING' ||
        previousbookings.status !== 'UNDERPROCESSED'
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
          metadata: paymentDetailsJson ?? {},
          paymentMethod: paymentDetailsJson?.paymentMethod ?? 'UNKNOWN',
          settledAt: razorpayPayment.created_at
            ? razorpayPayment.created_at * 1000 // Razorpay returns UNIX seconds
            : new Date().getTime(),
          Booking: {
            update: { data: { bookingstatus: BookingStatusEnum.UNDERREVIEW } },
          },
        },
      });
      return { success: true };
    } catch (error:any) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedPayment(
    userInput: Pick<RazorpayVerifyPaymentDto, 'razorpay_order_id' | 'txnid'> & {
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
          paymentGatewayTxnId: userInput.razorpay_order_id,
          settledAt: new Date().getTime(),
          metadata: {
            error_code: userInput.error_code ?? null,
            error_description: userInput.error_description ?? null,
          },
          Booking: {
            update: {
              data: { bookingstatus: BookingStatusEnum.TRANSACTIONPENDING },
            },
          },
        },
      });
      return { success: 'true' };
    } catch (error:any) {
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
      const isValidSignature =
        this.paymentService.verifyPaymentSignature(userInput);
      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Razorpay signature for payment ${userInput.razorpay_payment_id}`,
        );
        return { error: { status: 403, message: 'Invalid payment signature' } };
      }
      if (!userInput.bookingid || typeof userInput.bookingid !== 'number') {
        return { error: { status: 422, message: 'Booking id required' } };
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
      await this.prismaService.$transaction([
        this.prismaService.transactionLedger.create({
          data: {
            status: TransactionStatusEnum.REFUNDED,
            paymentGatewayTxnId: userInput.razorpay_payment_id,
            transactionType: 'REFUND_TO_USER',
            metadata: paymentDetailsJson ?? {},
            txnId: userInput.txnid,
            paymentMethod: paymentDetailsJson.paymentMethod,
            netAmount: Number(razorpayPayment.amount),
            grossAmount: Number(razorpayPayment.amount),
            settledAt: razorpayPayment.created_at
              ? razorpayPayment.created_at * 1000
              : new Date().getTime(),
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
    } catch (error:any) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async onFailedRefundPayment(
    userInput: Pick<
      refundAmountInputDto,
      'razorpay_order_id' | 'txnid' | 'amount' | 'bookingid'
    > & {
      error_code?: string;
      error_description?: string;
    },
    userId: string,
  ) {
    try {
      const { error } = validateFailurePaymentStatus(userInput);
      if (error) return { error };
      await this.prismaService.transactionLedger.create({
        data: {
          status: TransactionStatusEnum.DECLINED,
          paymentGatewayTxnId: userInput.razorpay_order_id,
          transactionType: 'REFUND_TO_USER',
          fromParty: 'ADMIN',
          toParty: 'USER',
          metadata: {
            error_code: userInput.error_code ?? null,
            error_description: userInput.error_description ?? null,
          },
          txnId: userInput.txnid,
          paymentMethod: 'CASH',
          grossAmount: Number(userInput.amount),
          netAmount: Number(userInput.amount),
          settledAt: new Date().getTime(),
          FromPartyUser: { connect: { id: userId } },
          Booking: { connect: { id: userInput.bookingid } },
        },
      });
      return { success: 'true' };
    } catch (error:any) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async payPendingAmountToCompanion(
    updateparams: updatependingtransactionforcompanionDto,
    userId: string,
  ) {
    try {
      const { error } = validateadmincompaniontransaction(updateparams);
      if (error) {
        return { error };
      }
      const { data: paymentdata } = makePaymentdetailsjson(
        updateparams.metadata as unknown as RazorpayPaymentDetailsDto,
      );
      const allTxIds = updateparams.ids.split(',');
      const transactiondata =
        await this.prismaService.transactionLedger.findMany({
          where: {
            txnId: { in: allTxIds },
            status: TransactionStatusEnum.UNDERPROCESSED,
            toParty: 'COMPANION',
          },
          include: { ToPartyUser: true },
        });
      const allamounts = transactiondata.reduce(
        (acc, curr) => acc + (curr.netAmount || 0),
        0,
      );
      if (allamounts === 0) {
        return { error: { status: 422, message: 'No pending amount to pay' } };
      }
      await this.prismaService.transactionLedger.updateMany({
        where: {
          txnId: { in: allTxIds },
          status: TransactionStatusEnum.UNDERPROCESSED,
          toParty: 'COMPANION',
        },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: updateparams.txId,
          isSettled: true,
          fromUserId: userId,
          paymentMethod: (paymentdata && paymentdata.paymentMethod) || 'CASH',
          metadata: paymentdata || {},
          settledAt: Date.now(),
        },
      });
      return { data: { totalAmountPaid: allamounts } };
    } catch (error:any) {}
  }
}
