import { EmailRegex } from 'src/constants/regex.constants';
import { getHashInputDto } from 'src/dto/transactions.dto';

export const validatehashGeneration = (userinputs: getHashInputDto) => {
  if (!userinputs.amount) {
    return { error: { status: 422, message: 'Amount is required' } };
  } else if (!Number(userinputs.amount)) {
    return { error: { status: 422, messsage: 'Amount is not valid' } };
  } else if (!userinputs.email) {
    return { error: { status: 422, messsage: 'Email is required' } };
  } else if (!EmailRegex.test(userinputs.email)) {
    return { error: { status: 422, messsage: 'Email is not valid' } };
  } else if (!userinputs.firstname) {
    return { error: { status: 422, messsage: 'firstname is required' } };
  } else if (!userinputs.firstname.trim().length) {
    return { error: { status: 422, messsage: 'firstname is not valid' } };
  }
};
