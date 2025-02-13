import { Booking } from '@prisma/client';
import { errorDto } from './common.dto';
import { userCompanionFindLocationInputDto } from './companionfind.dto';

export enum BookingDurationUnitEnum {
  HOUR = 'HOUR',
  MINUTE = 'MINUTE',
}

export enum NotificationFromModuleEnum {
  BOOKING = 'BOOKING',
  RATING = 'RATING',
  TRANSACTIONS = 'TRANSACTIONS',
  USER = 'USER',
  GLOBAL = 'GLOBAL',
}

export enum BookingStatusEnum {
  ACCEPTED = 'ACCEPTED',
  UNDERREVIEW = 'UNDERREVIEW',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  UNDERCANCELLATION = 'UNDERCANCELLATION',
  CANCELLATIONAPPROVED = 'CANCELLATIONAPPROVED',
  CANCELLED = 'CANCELLED',
  TRANSACTIONPENDING = 'TRANSACTIONPENDING',
}
export interface UserBookingReturnDto extends errorDto {
  data?: Booking[];
}

export interface userBookingBodyDto {
  userId: string;
  companionId: string;
  bookingdate: string;
  bookingduration: number;
  bookingdurationUnit: BookingDurationUnitEnum;
  bookinglocation: userCompanionFindLocationInputDto;
  purpose: string
}

export interface userBookingReturnDto extends errorDto {
  data?: userBookingBodyDto;
}

export interface companionslotsavailabilityDto {
  start: number;
  end: number;
}

export interface cancelBookingInputDto {
  bookingid: number;
  userId: string;
}

export interface bookingIdDto {
  bookingid: number;
}

export interface ratingInputDto {
  comment: string;
  rating: number;
  bookingid: number;
}

export interface userRatingDto extends ratingInputDto{
  userId: string
}