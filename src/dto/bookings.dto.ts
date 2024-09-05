import { Booking } from "@prisma/client";
import { errorDto } from "./common.dto";

export interface UserBookingReturnDto extends errorDto{
    data?: Booking[]
}