import { Booking, Companion } from '@prisma/client';
import * as dayjs from 'dayjs';
import {
  companionslotsavailabilityDto,
  userBookingBodyDto,
} from 'src/dto/bookings.dto';

export const getFinalRate = (
  userInfo: userBookingBodyDto,
  companion: Companion,
) => {
  let amount = 0;
  if (
    userInfo.bookingdurationUnit === 'HOUR' &&
    companion.bookingrateunit === 'PERHOUR'
  ) {
    amount = userInfo.bookingduration * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'MINUTE' &&
    companion.bookingrateunit === 'PERMINUTE'
  ) {
    amount = userInfo.bookingduration * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'MINUTE' &&
    companion.bookingrateunit === 'PERHOUR'
  ) {
    amount = userInfo.bookingduration * 0.0166667 * companion.bookingrate;
  } else if (
    userInfo.bookingdurationUnit === 'HOUR' &&
    companion.bookingrateunit === 'PERMINUTE'
  ) {
    amount = userInfo.bookingduration * 60 * companion.bookingrate;
  }
  return amount + amount * 0.18;
};

export const filterSlotAvailability = (
  bookingDetails: Booking[],
): companionslotsavailabilityDto[] => {
  const bookings = bookingDetails.map((l) => ({
    start: Number(String(l.bookingstart)),
    end: dayjs(Number(l.bookingend)).add(1, 'hour').valueOf(),
  }));
  return bookings;
};

export const getAverageRatingRawQuery = (companionId: string) => {
  return `
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
ORDER BY ps."rateeId"`;
};

export const getCompanionDetailsQueryforupdateRate = (companionId: string) => {
  return `
     SELECT
  	c.id,
    c."Images",
    c."firstname",
    c."lastname",
    c."gender",
    c."age",
    l."city",
    l."state",
    comp."bookingrate",
      -- Total Booking Hours (in hours)
      SUM(EXTRACT(EPOCH FROM (TO_TIMESTAMP(b."bookingend" / 1000) - TO_TIMESTAMP(b."bookingstart" / 1000))) / 3600) AS totalBookingHours,
      -- Average Rating (out of 5)
      COALESCE(AVG(r."ratings"), 0) AS averageRating,
      -- Last 24 Hours Bookings
      JSON_AGG(
        JSON_BUILD_OBJECT(
        'id', b."id",
          'bookingstart', b."bookingstart",
          'bookingend', b."bookingend"
        )
      ) FILTER (WHERE TO_TIMESTAMP(b."bookingstart" / 1000) >= NOW() - INTERVAL '24 hours') AS last24HoursBookings,
      -- Last 7 Days Bookings
      JSON_AGG(
        JSON_BUILD_OBJECT(
        'id', b."id",
          'bookingstart', b."bookingstart",
          'bookingend', b."bookingend"
        )
      ) FILTER (WHERE TO_TIMESTAMP(b."bookingstart" / 1000) >= NOW() - INTERVAL '7 days') AS last7DaysBookings,
    JSON_AGG(
        JSON_BUILD_OBJECT(
        'id', b."id",
          'bookingstart', b."bookingstart",
          'bookingend', b."bookingend"
        )
      ) FILTER (WHERE TO_TIMESTAMP(b."bookingstart" / 1000) >= NOW() - INTERVAL '30 days') AS last30DaysBookings
    FROM "User" c
    LEFT JOIN "_BookingToUser" cb ON c."id" = cb."B"
    LEFT JOIN "Booking" b ON cb."A" = b."id"
    LEFT JOIN "rating" r ON c."id" = r."rateeId"
    LEFT JOIN "Companion" comp ON comp."userid" = c."id"
    LEFT JOIN "location" l ON l."userid" = comp."id"
    WHERE c.id = '${companionId}' AND 
    (b.bookingstatus = 'ACCEPTED' OR b.bookingstatus = 'COMPLETED')
    GROUP BY c."id", l."city", l."state",comp."bookingrate";
  `;
};
