import { Booking } from '@prisma/client';
import { errorDto } from './common.dto';
import { userCompanionFindLocationInputDto } from './companionfind.dto';

export enum BookingDurationUnitEnum {
  HOUR = 'HOUR',
  MINUTE = 'MINUTE',
}
export interface UserBookingReturnDto extends errorDto {
  data?: Booking[];
}

export interface userBookingBodyDto {
  userId: string;
  companionId: string;
  bookingdate: Date;
  bookingduration: number;
  bookingdurationUnit: BookingDurationUnitEnum;
  bookinglocation: userCompanionFindLocationInputDto;
}

export interface userBookingReturnDto extends errorDto{
  data?: userBookingBodyDto
}

export interface companionslotsavailabilityDto {
  start: number;
  end: number;
}