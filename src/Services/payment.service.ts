import { Injectable, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import {
  getHashInputDto,
  initiatePaymentInputDto,
  RazorpayOrderResponseDto,
  RazorpayPaymentDetailsDto,
  RazorpayVerifyPaymentDto,
} from 'src/dto/transactions.dto';
import { getTxnId } from '../utils/uuid.utils';

@Injectable()
export class PaymentService {
  private readonly client: Razorpay;
  private readonly logger = new Logger(PaymentService.name);

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required',
      );
    }

    this.client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Generates a short reference id used as the internal transaction id (txnId).
   * This is stored in our DB and returned to the client so the client can
   * correlate the Razorpay order with our booking.
   */
  async generateHash(userInput: getHashInputDto) {
    try {
      const txnid = getTxnId();
      // Razorpay does not use a client-side hash for order creation.
      // We return the txnid so the caller can embed it in the order receipt.
      return { data: { txnid } };
    } catch (error:any) {
      this.logger.error('generateHash error', error?.message);
      return { error: { status: 500, message: error?.message } };
    }
  }

  /**
   * Creates a Razorpay order and returns the order object alongside our
   * internal txnId. The UI uses the order_id + key_id to open the checkout.
   *
   * Amount: Razorpay expects amount in **paise** (1 INR = 100 paise).
   * The incoming `inputs.amount` is treated as INR (string), converted here.
   */
  async initiatePayment(
    inputs: initiatePaymentInputDto,
  ): Promise<{
    data?: RazorpayOrderResponseDto;
    values?: { txnid: string; orderId: string };
    error?: { status: number; message: string };
  }> {
    try {
      const { data: hashData } = await this.generateHash(inputs);
      const txnid = hashData.txnid;

      const amountInPaise = Math.round(parseFloat(inputs.amount) * 100);
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        return { error: { status: 422, message: 'Invalid payment amount' } };
      }

      const order = await this.client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: txnid, // our internal txnId — used to tie back on callback
        notes: {
          bookingId: String(inputs.bookingId),
          email: inputs.email,
          firstname: inputs.firstname,
          productinfo: inputs.productinfo,
        },
      });

      const responseDto: RazorpayOrderResponseDto = {
        orderId: order.id,
        amount: order.amount as number,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
        prefill: {
          name: inputs.firstname,
          email: inputs.email,
          contact: inputs.phone,
        },
        notes: order.notes as Record<string, string>,
      };

      return { data: responseDto, values: { txnid, orderId: order.id } };
    } catch (error:any) {
      this.logger.error('initiatePayment error', error?.message);
      return { error: { status: 500, message: error?.message ?? 'Payment initiation failed' } };
    }
  }

  /**
   * Verifies the Razorpay payment signature.
   * MUST be called before marking any transaction as successful.
   *
   * Signature = HMAC-SHA256( razorpay_order_id + '|' + razorpay_payment_id )
   *             using RAZORPAY_KEY_SECRET
   */
  verifyPaymentSignature(payload: RazorpayVerifyPaymentDto): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        payload;

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        this.logger.error('RAZORPAY_KEY_SECRET is not set');
        return false;
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      // Constant-time comparison is not natively available in Node crypto for
      // strings, so compare via Buffer to avoid timing attacks.
      const expected = Buffer.from(expectedSignature, 'hex');
      const received = Buffer.from(razorpay_signature, 'hex');

      if (expected.length !== received.length) return false;

      let diff = 0;
      for (let i = 0; i < expected.length; i++) {
        diff |= expected[i] ^ received[i];
      }
      return diff === 0;
    } catch (error:any) {
      this.logger.error('verifyPaymentSignature error', error?.message);
      return false;
    }
  }

  /**
   * Fetches full payment details from Razorpay using the payment id.
   * Used after signature verification to get method, card, bank, vpa, etc.
   */
  async getPaymentDetails(
    paymentId: string,
  ): Promise<{
    data?: RazorpayPaymentDetailsDto;
    error?: { status: number; message: string };
  }> {
    try {
      const payment = await this.client.payments.fetch(paymentId);
      return { data: payment as unknown as RazorpayPaymentDetailsDto };
    } catch (error:any) {
      this.logger.error('getPaymentDetails error', error?.message);
      return {
        error: {
          status: 500,
          message: error?.message ?? 'Failed to fetch payment details',
        },
      };
    }
  }
}
