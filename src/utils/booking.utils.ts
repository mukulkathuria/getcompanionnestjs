import { Booking, Companion, PrismaClient } from '@prisma/client';
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


export const getAverageRatingRawQuery = (companionId: string) => {
  return`
  WITH product_stats AS (
    SELECT 
        r."rateeId",
        AVG(r.ratings) AS avg_rating,  
        COUNT(r.ratings) AS rating_count, 
        SUM(r.ratings) AS total_ratings, 
        MAX(r."createdAt") AS last_rating_time,  
        (SELECT r2.ratings 
         FROM rating r2 
         WHERE r2."rateeId" = r."rateeId"  
         ORDER BY r2."createdAt" DESC 
         LIMIT 1) AS last_rating  
    FROM rating r
    WHERE r."rateeId" = '${companionId}' 
    GROUP BY r."rateeId" 
),
global_stats AS (
    SELECT 
        AVG(r.ratings) AS global_avg,  
        COUNT(r.ratings) AS global_rating_count  
    FROM rating r
)
SELECT 
    ps."rateeId",
    ps.avg_rating, 
    ps.last_rating,  
	  ps.rating_count,
    (gs.global_avg * gs.global_rating_count + ps.total_ratings) / (gs.global_rating_count + ps.rating_count) AS bayesian_avg
FROM product_stats ps, global_stats gs
ORDER BY ps."rateeId"`
}