import { Transactions } from "@prisma/client";
import { errorDto } from "./common.dto";

export interface BookingTransactionReturnDto extends errorDto{
    data?: Transactions[]
}