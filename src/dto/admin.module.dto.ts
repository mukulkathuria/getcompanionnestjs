import { bookingIdDto } from './bookings.dto';
import { RazorpayVerifyPaymentDto } from './transactions.dto';

export interface AmountDto {
  amount: number;
}

export interface statusUpdateInputDto {
  id: string;
  approve?: boolean;
  reject?: boolean;
}

export interface updateCompanionPriceInputDto {
  updatedprice: number;
}

export interface refundAmountInputDto
  extends RazorpayVerifyPaymentDto, bookingIdDto, AmountDto {}
