import { Booking } from '@prisma/client';
import { errorDto } from './common.dto';
import { BookingRateUnitEnum } from './user.dto';

export interface UserBookingReturnDto extends errorDto {
  data?: Booking[];
}

export interface userBookingBodyDto {
  userId: string;
  companionId: string;
  bookingdate: Date;
  bookingduration: number;
  bookingdurationUnit: BookingRateUnitEnum;
}
