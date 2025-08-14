import { Booking } from 'src/schema/app/generated/prisma/client';

export const filterUnderreviewBooking = (bookingDetails: Booking[]) => {
  return bookingDetails.map((l) => ({
    id: l.id,
    start: String(l.bookingstart),
    rate: l.finalRate,
  }));
};
