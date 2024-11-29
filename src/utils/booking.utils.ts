import { Booking, Companion } from '@prisma/client';
import * as dayjs from 'dayjs';
import { companionslotsavailabilityDto, userBookingBodyDto } from 'src/dto/bookings.dto';

export const getFinalRate = (
  userInfo: userBookingBodyDto,
  companion: Companion,
) => {
  // minute // hour
  if (
    userInfo.bookingdurationUnit === 'HOUR' &&
    companion.bookingrateunit === 'PERHOUR'
  ) {
    return userInfo.bookingduration * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'MINUTE' &&
    companion.bookingrateunit === 'PERMINUTE'
  ) {
    return userInfo.bookingduration * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'MINUTE' &&
    companion.bookingrateunit === 'PERHOUR'
  ) {
    return userInfo.bookingduration * 0.0166667 * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'HOUR' &&
    companion.bookingrateunit === 'PERMINUTE'
  ) {
    return userInfo.bookingduration * 60 * companion.bookingrate;
  }
  return userInfo.bookingduration * companion.bookingrate;
};


export const filterSlotAvailability = (bookingDetails: Booking[]): companionslotsavailabilityDto[] => {
  const bookings = bookingDetails.map((l) => ({
    start: l.bookingrate,
    end: dayjs(Number(l.bookingend)).add(1, 'hour').valueOf(),
  }));
  return bookings;
};
