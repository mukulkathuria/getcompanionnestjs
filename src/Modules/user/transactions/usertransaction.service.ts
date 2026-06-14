import { Injectable, Logger } from '@nestjs/common';
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

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

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

  async getPreviousTransactions(userId: string) {
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

  // ---------------------------------------------------------------------------
  // Step 1 — Hash / token generation (kept for API compatibility)
  // ---------------------------------------------------------------------------

  /**
   * Returns a new internal txnId.  In the Razorpay flow the "hash" is no
   * longer a client-side concern; this method remains for API compatibility
   * and can be used to pre-generate a txnId before calling initiatePayment.
   */
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

  // ---------------------------------------------------------------------------
  // Step 2 — Create Razorpay order + pending transaction record
  // ---------------------------------------------------------------------------

  /**
   * Creates a Razorpay order and a corresponding UNDERPROCESSED transaction
   * in our DB.  Returns the Razorpay order details the UI needs to open the
   * checkout (orderId, amount, currency, keyId, prefill).
   */
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

      // Resolve the user by email to get the DB id
      const userDetails = await this.prismaService.user.findUnique({
        where: { email: userInput.email },
      });

      if (!userDetails) {
        return { error: { status: 404, message: 'User not found' } };
      }

      // Persist the pending transaction so we can update it on callback
      await this.prismaService.transactionLedger.create({
        data: {
          txnId: values.txnid,
          FromPartyUser: { connect: { id: userDetails.id } },
          Booking: { connect: { id: userInput.bookingId } },
          netAmount: Number(userInput.amount),
          grossAmount: Number(userInput.amount),
          taxAmount: Number(userInput.amount) * 0.05,
          status: TransactionStatusEnum.UNDERPROCESSED,
          toParty: 'ADMIN',
          fromParty: 'USER',
          transactionType: 'BOOKING_PAYMENT',
          // Will be replaced with the real Razorpay payment id on success callback
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

  // ---------------------------------------------------------------------------
  // Step 3a — Success callback: verify signature → fetch details → update DB
  // ---------------------------------------------------------------------------

  /**
   * Handles the Razorpay success callback for a booking payment.
   *
   * Flow:
   *  1. Validate payload fields.
   *  2. Verify HMAC-SHA256 signature — reject immediately if invalid.
   *  3. Look up the pending transaction by txnid.
   *  4. Fetch full payment details from Razorpay.
   *  5. Map to our DB shape and update both TransactionLedger + Booking.
   */
  async onsuccessfullPayment(userInput: RazorpayVerifyPaymentDto) {
    try {
      // 1. Field validation
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };

      // 2. Signature verification — critical security step
      const isValidSignature =
        this.paymentService.verifyPaymentSignature(userInput);
      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Razorpay signature for payment ${userInput.razorpay_payment_id}`,
        );
        return { error: { status: 403, message: 'Invalid payment signature' } };
      }

      // 3. Look up pending transaction
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

      // 4. Fetch authoritative payment details from Razorpay
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

      // 5. Map to DB shape
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

  // ---------------------------------------------------------------------------
  // Step 3b — Failure callback: mark transaction as declined
  // ---------------------------------------------------------------------------

  /**
   * Handles the Razorpay failure callback for a booking payment.
   * On failure Razorpay returns the order_id; we use our txnid (stored as
   * the order receipt) to look up and decline the pending transaction.
   */
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

      return { success: true };
    } catch (error: any) {
      this.logger.error('onFailedPayment', error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  // ---------------------------------------------------------------------------
  // Extension payment — success
  // ---------------------------------------------------------------------------

  /**
   * Handles Razorpay success callback for a booking extension payment.
   * Same signature-verification + fetch-details pattern as the base flow.
   */
  async onsuccessfullPaymentofExtension(userInput: RazorpayVerifyPaymentDto) {
    try {
      // 1. Field validation
      const { error } = validatePaymentStatus(userInput);
      if (error) return { error };

      // 2. Signature verification
      const isValidSignature =
        this.paymentService.verifyPaymentSignature(userInput);
      if (!isValidSignature) {
        this.logger.warn(
          `Invalid Razorpay signature for extension payment ${userInput.razorpay_payment_id}`,
        );
        return { error: { status: 403, message: 'Invalid payment signature' } };
      }

      // 3. Look up pending transaction + booking + sessions
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

      // 4. Fetch authoritative payment details from Razorpay
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

      // 5. Map to DB shape
      const { data: paymentDetailsJson } =
        makePaymentdetailsjson(razorpayPayment);

      // Amount paid via Razorpay is in paise — convert back to INR for the DB
      const amountPaidInRupees = razorpayPayment.amount / 100;

      await this.prismaService.transactionLedger.update({
        where: { txnId: userInput.txnid },
        data: {
          status: TransactionStatusEnum.COMPLETED,
          paymentGatewayTxnId: userInput.razorpay_payment_id,
          metadata: paymentDetailsJson ?? {},
          paymentMethod: paymentDetailsJson?.paymentMethod ?? 'UNKNOWN',
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
    } catch (error:any) {
      this.logger.error('onsuccessfullPaymentofExtension', error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  // ---------------------------------------------------------------------------
  // Extension payment — failure
  // ---------------------------------------------------------------------------

  async onFailedPaymentofExtension(
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
