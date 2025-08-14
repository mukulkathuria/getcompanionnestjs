import { Booking } from 'src/schema/app/generated/prisma/client';
import { errorDto } from './common.dto';

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
  UNDEREXTENSION = 'UNDEREXTENSION',
  CANCELLEDREFUNDPENDING = 'CANCELLEDREFUNDPENDING',
}
export interface UserBookingReturnDto extends errorDto {
  data?: Booking[];
}

export interface BookingMeetingLocationDto {
  lat: number;
  lng: number;
  city: string;
  state: string;
  name: string;
  userInput: string;
  formattedaddress: string;
  googleextra: object;
}

export interface userBookingBodyDto {
  userId: string;
  companionId: string;
  bookingdate: string;
  bookingduration: number;
  bookingdurationUnit: BookingDurationUnitEnum;
  bookinglocation: BookingMeetingLocationDto;
  purpose: string;
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
  reason?: string;
}

export interface bookingIdDto {
  bookingid: number;
}

export interface ratingInputDto {
  comment: string;
  rating: number;
  bookingid: number;
}

export interface userRatingDto extends ratingInputDto {
  userId: string;
}

export interface updateextensionbokingInputDto {
  bookingid: number;
  extendedhours: number;
  extentedfinalrate: number;
  updatedLocation?: BookingMeetingLocationDto;
  updatedPurpose?: string;
}

export interface pageNoQueryDto {
  pageNo: string;
}

export interface updateBookingStatusInputDto extends bookingIdDto {
  status: BookingStatusEnum;
}

export interface bookinglocationPrismaDto {
  city?: string;
  zipcode?: number;
  state: string;
  lat: number;
  lng: number;
  userinput?: string;
  googleloc: string;
  googleplaceextra?: { [key: string]: string };
  googleformattedadress: string;
}
