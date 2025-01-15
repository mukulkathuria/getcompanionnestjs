import { EmailRegex } from 'src/constants/regex.constants';
import { successErrorDto } from 'src/dto/common.dto';
import { getHashInputDto, initiatePaymentInputDto } from 'src/dto/transactions.dto';

export const validatehashGeneration = (userinputs: getHashInputDto): successErrorDto => {
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

export const validatePaymentInitiation = (userinputs: initiatePaymentInputDto): successErrorDto => {
  const { error } = validatehashGeneration(userinputs);
  if(error){
    return { error }
  }
  if (!userinputs.phone) {
    return { error: { status: 422, message: 'Phone is required' } };
  } else if (!userinputs.phone.trim().length) {
    return { error: { status: 422, message: 'Phone is not valid' } };
  } else if (!userinputs.surl) {
    return { error: { status: 422, message: 'Surl is required' } };
  } else if (!userinputs.surl.trim().length) {
    return { error: { status: 422, message: 'Surl is not valid' } };
  } else if (!userinputs.furl) {
    return { error: { status: 422, message: 'Furl is required' } };
  } else if (!userinputs.furl.trim().length) {
    return { error: { status: 422, message: 'Furl is not valid' } };
  }
  return { success: true }
}