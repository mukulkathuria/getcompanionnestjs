import { EmailRegex } from 'src/constants/regex.constants';
import { updatependingtransactionforcompanionDto } from 'src/dto/bookings.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  getHashInputDto,
  initiatePaymentInputDto,
  RazorpayVerifyPaymentDto,
} from 'src/dto/transactions.dto';

/**
 * Validates the minimum required fields to generate a hash / create an order.
 */
export const validatehashGeneration = (
  userinputs: getHashInputDto,
): successErrorDto => {
  if (!userinputs.amount) {
    return { error: { status: 422, message: 'Amount is required' } };
  } else if (!Number(userinputs.amount) || Number(userinputs.amount) <= 0) {
    return { error: { status: 422, message: 'Amount is not valid' } };
  } else if (!userinputs.email) {
    return { error: { status: 422, message: 'Email is required' } };
  } else if (!EmailRegex.test(userinputs.email)) {
    return { error: { status: 422, message: 'Email is not valid' } };
  } else if (!userinputs.firstname) {
    return { error: { status: 422, message: 'firstname is required' } };
  } else if (!userinputs.firstname.trim().length) {
    return { error: { status: 422, message: 'firstname is not valid' } };
  }
  return { success: true };
};

/**
 * Validates all fields required to initiate a Razorpay order.
 */
export const validatePaymentInitiation = (
  userinputs: initiatePaymentInputDto,
): successErrorDto => {
  const { error } = validatehashGeneration(userinputs);
  if (error) {
    return { error };
  }

  if (!userinputs.productinfo) {
    return { error: { status: 422, message: 'Product Info is required' } };
  } else if (!userinputs.productinfo.trim().length) {
    return { error: { status: 422, message: 'Product Info is not valid' } };
  } else if (
    !userinputs.bookingId ||
    typeof userinputs.bookingId !== 'number'
  ) {
    return { error: { status: 422, message: 'Booking Id is required' } };
  }
  return { success: true };
};

/**
 * Validates the Razorpay payment verification payload sent from the client
 * after the checkout flow completes successfully.
 *
 * All three Razorpay fields + our internal txnid must be present and non-empty.
 */
export const validatePaymentStatus = (
  details: RazorpayVerifyPaymentDto,
): successErrorDto => {
  if (!details?.razorpay_payment_id?.trim()) {
    return { error: { status: 422, message: 'Payment ID is required' } };
  } else if (!details?.razorpay_order_id?.trim()) {
    return { error: { status: 422, message: 'Order ID is required' } };
  } else if (!details?.razorpay_signature?.trim()) {
    return { error: { status: 422, message: 'Payment signature is required' } };
  } else if (!details?.txnid?.trim()) {
    return { error: { status: 422, message: 'Transaction ID is required' } };
  }
  return { success: true };
};

/**
 * Validates the minimum fields needed to record a failed payment.
 * On failure the client still provides the order_id and our internal txnid
 * so we can look up and update the pending transaction record.
 */
export const validateFailurePaymentStatus = (
  details: Pick<RazorpayVerifyPaymentDto, 'razorpay_order_id' | 'txnid'>,
): successErrorDto => {
  if (!details?.razorpay_order_id?.trim()) {
    return { error: { status: 422, message: 'Order ID is required' } };
  } else if (!details?.txnid?.trim()) {
    return { error: { status: 422, message: 'Transaction ID is required' } };
  }
  return { success: true };
};

/**
 * Validates the admin companion transaction update payload.
 * The metadata field is expected to carry a Razorpay verification payload.
 */
export const validateadmincompaniontransaction = (
  data: updatependingtransactionforcompanionDto,
): successErrorDto => {
  if (!data.txId) {
    return {
      error: { status: 422, message: 'Razorpay Transaction id is required' },
    };
  } else if (!data.ids) {
    return { error: { status: 422, message: 'Transaction ids is required' } };
  } else if (!data.ids.split(',').filter(Boolean).length) {
    return { error: { status: 422, message: 'Transaction ids is not valid' } };
  } else if (!data.netamount) {
    return { error: { status: 422, message: 'Net amount is required' } };
  } else if (typeof data.netamount !== 'number' || data.netamount <= 0) {
    return { error: { status: 422, message: 'Net amount is not valid' } };
  } else if (data.metadata && typeof data.metadata !== 'object') {
    return { error: { status: 422, message: 'Metadata is not valid' } };
  }

  // Validate that the metadata carries a valid Razorpay verification payload
  const { error } = validatePaymentStatus(
    data.metadata as unknown as RazorpayVerifyPaymentDto,
  );
  if (error) {
    return { error };
  }
  return { success: true };
};
