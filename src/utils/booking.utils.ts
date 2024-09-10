import { Companion } from '@prisma/client';
import { userBookingBodyDto } from 'src/dto/bookings.dto';

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
