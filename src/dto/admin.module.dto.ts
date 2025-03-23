import { bookingIdDto } from "./bookings.dto";
import { payUTransactionDetailsDto } from "./transactions.dto";

export interface statusUpdateInputDto {
    id: string;
    approve?: boolean;
    reject?: boolean;
}

export interface updateCompanionPriceInputDto {
    updatedprice: number;
}

export interface refundAmountInputDto extends payUTransactionDetailsDto, bookingIdDto{}