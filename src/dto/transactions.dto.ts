import { Transactions } from "@prisma/client";
import { errorDto } from "./common.dto";

export interface BookingTransactionReturnDto extends errorDto{
    data?: Transactions[]
}

export interface getHashInputDto {
    firstname: string;
    email: string;
    amount: string;
    productinfo: string;
}