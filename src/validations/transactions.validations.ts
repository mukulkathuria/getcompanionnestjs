import { EmailRegex } from 'src/constants/regex.constants';
import { updatependingtransactionforcompanionDto } from 'src/dto/bookings.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  getHashInputDto,
  initiatePaymentInputDto,
  payUTransactionDetailsDto,
} from 'src/dto/transactions.dto';

export const validatehashGeneration = (
  userinputs: getHashInputDto,
): successErrorDto => {
  if (!userinputs.amount) {
    return { error: { status: 422, message: 'Amount is required' } };
  } else if (!Number(userinputs.amount)) {
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

export const validatePaymentInitiation = (
  userinputs: initiatePaymentInputDto,
): successErrorDto => {
  const { error } = validatehashGeneration(userinputs);
  if (error) {
    return { error };
  }
  if (!userinputs.surl) {
    return { error: { status: 422, message: 'Surl is required' } };
  } else if (!userinputs.surl.trim().length) {
    return { error: { status: 422, message: 'Surl is not valid' } };
  } else if (!userinputs.furl) {
    return { error: { status: 422, message: 'Furl is required' } };
  } else if (!userinputs.furl.trim().length) {
    return { error: { status: 422, message: 'Furl is not valid' } };
  } else if (!userinputs.productinfo) {
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

export const validatePaymentStatus = (
  details: payUTransactionDetailsDto,
): successErrorDto => {
  if (!details.amount?.trim().length) {
    return { error: { status: 422, message: 'Amount is required' } };
  } else if (!details.mode?.trim().length) {
    return { error: { status: 422, message: 'Payment Mode is required' } };
  } else if (!details.txnid?.trim().length) {
    return { error: { status: 422, message: 'Transaction is required' } };
  }
  return { success: true };
};

export const validateFailurePaymentStatus = (
  details: payUTransactionDetailsDto,
): successErrorDto => {
  if (!details.amount?.trim().length) {
    return { error: { status: 422, message: 'Amount is required' } };
  } else if (!details.txnid?.trim().length) {
    return { error: { status: 422, message: 'Transaction is required' } };
  }
  return { success: true };
};

export const validateadmincompaniontransaction = (
  data: updatependingtransactionforcompanionDto,
): successErrorDto => {
  if (!data.txId) {
    return { error: { status: 422, message: 'Transaction id is required' } };
  } else if (!data.companionids) {
    return { error: { status: 422, message: 'Companion ids is required' } };
  } else if(!data.companionids.split(',').length){
    return { error: { status: 422, message: 'Companion ids is not valid' } };
  } else if (data.netamount && typeof data.netamount !== 'number') {
    return { error: { status: 422, message: 'Net amount is not valid' } };
  } else if (data.metadata && typeof data.metadata !== 'object') {
    return { error: { status: 422, message: 'Metadata is not valid' } };
  }
  return { success: true };
};
