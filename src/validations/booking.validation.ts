import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  BookingDurationUnitEnum,
  BookingMeetingLocationDto,
  BookingStatusEnum,
  cancelBookingInputDto,
  ratingInputDto,
  updateBookingStatusInputDto,
  userBookingBodyDto,
  userBookingReturnDto,
} from 'src/dto/bookings.dto';
import { successErrorDto, successErrorReturnDto } from 'src/dto/common.dto';
import { getErrorMessage } from 'src/utils/common.utils';

export function isUserBookingValid(
  userinfo: userBookingBodyDto,
): userBookingReturnDto {
  dayjs.extend(customParseFormat);
  if (!userinfo.companionId || !userinfo.companionId?.trim().length) {
    return { error: { status: 422, message: 'Companion Id is required' } };
  } else if (!userinfo.userId || !userinfo.userId?.trim().length) {
    return { error: { status: 422, message: 'User Id is required' } };
  } else if (
    !userinfo.bookingdate ||
    !dayjs(userinfo.bookingdate, 'MM-DD-YYYY HH:mm:ss', true).isValid()
  ) {
    return { error: { status: 422, message: 'Booking Date is required' } };
  } else if (
    !userinfo.bookingdurationUnit ||
    !BookingDurationUnitEnum[userinfo.bookingdurationUnit]
  ) {
    return {
      error: { status: 422, message: 'Booking Duration Unit is required' },
    };
  } else if (
    !userinfo.bookingduration ||
    typeof userinfo.bookingduration !== 'number'
  ) {
    return { error: { status: 422, message: 'Booking Duration is required' } };
  } else if (dayjs(userinfo.bookingdate).isBefore(new Date(), 'hour')) {
    return {
      error: { status: 422, message: "You can't book on past date" },
    };
  } else if (!userinfo.purpose || !userinfo.purpose.trim().length) {
    return {
      error: { status: 422, message: 'Booking purpose is required' },
    };
  } else if (!userinfo.bookinglocation.name.trim().length) {
    return { error: { status: 422, message: 'Booking place is required' } };
  } else if (!userinfo.bookinglocation.formattedaddress.trim().length) {
    return { error: { status: 422, message: 'Booking address is required' } };
  } else if (
    !userinfo?.bookinglocation?.city?.trim().length ||
    !userinfo.bookinglocation?.lat ||
    !userinfo.bookinglocation?.lng
  ) {
    return {
      error: { status: 422, message: 'Booking Location is required' },
    };
  } else if (
    userinfo.bookinglocation.googleextra &&
    typeof userinfo.bookinglocation.googleextra !== 'object'
  ) {
    return { error: { status: 422, message: 'Google parameter is not valid' } };
  }
  return { data: userinfo };
}

export function checkValidCancelBookngInputs(
  cancelInputs: cancelBookingInputDto,
  userId: string,
): successErrorDto {
  if (!userId) {
    return { error: { status: 422, message: 'User Id is required' } };
  } else if (!cancelInputs.bookingid) {
    return { error: { status: 422, message: 'Booking Id is required' } };
  } else if (cancelInputs.reason && !cancelInputs.reason.trim().length) {
    return { error: { status: 422, message: 'Reason must be valid' } };
  }
  return { success: true };
}

export function checkvalidrating(
  inputs: ratingInputDto,
): successErrorReturnDto {
  if (!inputs.bookingid || typeof inputs.bookingid !== 'number') {
    return { error: { status: 422, message: 'Comment is required ' } };
  } else if (!inputs.comment || !inputs.comment.trim().length) {
    return { error: { status: 422, message: 'Comment is required ' } };
  } else if (!inputs.rating || typeof inputs.rating !== 'number') {
    return { error: { status: 422, message: 'Ratings are required' } };
  } else if (inputs.rating < 0 || inputs.rating > 5) {
    return { error: { status: 422, message: 'Rating must be in 0 to 5 only' } };
  }
  return { success: true };
}

export function validateBookingStatusInput(
  input: updateBookingStatusInputDto,
): successErrorReturnDto {
  if (!input.bookingid || typeof input.bookingid !== 'number') {
    return { error: { status: 422, message: 'Booking id is required' } };
  } else if (!input.status) {
    return { error: { status: 422, message: 'Booking status is required' } };
  } else if (!BookingStatusEnum[input.status]) {
    return { error: { status: 422, message: 'Booking status is not valid' } };
  }
  return { success: true };
}

export const bookingLocationValidation = (
  input: BookingMeetingLocationDto,
): successErrorReturnDto => {
  if (!input.city || input.city.trim()) {
    return getErrorMessage(422, 'City is required');
  } else if (!input.state || input.state.trim()) {
    return getErrorMessage(422, 'State is required');
  } else if (!input.name || input.name.trim()) {
    return getErrorMessage(422, 'Name of place is required');
  } else if (!input.formattedaddress || input.formattedaddress.trim()) {
    return getErrorMessage(422, 'Address is required');
  } else if (typeof input.lat !== 'number') {
    return getErrorMessage(422, 'Latitude is required');
  } else if (typeof input.lng !== 'number') {
    return getErrorMessage(422, 'Longitude is required');
  }
  return { success: true };
};
