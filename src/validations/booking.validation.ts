import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  BookingDurationUnitEnum,
  userBookingBodyDto,
  userBookingReturnDto,
} from 'src/dto/bookings.dto';

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
  }
  return { data: userinfo };
}
