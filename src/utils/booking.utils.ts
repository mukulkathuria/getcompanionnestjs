import { Booking, Companion } from '@prisma/client';
import * as dayjs from 'dayjs';
import {
  companionslotsavailabilityDto,
  userBookingBodyDto,
} from 'src/dto/bookings.dto';
import { AvailableTimeSlotBigInt } from 'src/dto/companionsetting.dto';

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
  return amount + amount * 0.05;
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
    COALESCE(
          json_agg(row_to_json(pay)) FILTER (WHERE pay.id IS NOT NULL), 
          '[]'::json
      ) AS user_payment_methods,
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
	  LEFT JOIN "userpaymentmethods" pay ON c."id" = pay."userid"
    WHERE c.id = '${companionId}' AND 
    (b.bookingstatus = 'ACCEPTED' OR b.bookingstatus = 'COMPLETED')
    GROUP BY c."id", l."city", l."state",comp."bookingrate";
  `;
};

export function generateStimeSlots(startMs: number, endMs: number) {
  let startTime = new Date(startMs).getHours();
  let endTime = new Date(endMs).getHours();
  let times = [];
  console.log('function generateStimeSlots ', { startTime, endTime });
  while (startTime < endTime) {
    let starthours = startTime;
    let startampm = starthours >= 12 ? 'PM' : 'AM';
    starthours = starthours % 12;
    starthours = starthours ? starthours : 12;
    let formattedstartTime = starthours + ':' + '00' + ' ' + startampm;
    let endhours = startTime + 1;
    let endampm = endhours >= 12 ? 'PM' : 'AM';
    endhours = endhours % 12;
    endhours = endhours ? endhours : 12;
    let formattedendTime = endhours + ':' + '00' + ' ' + endampm;
    times.push(`${formattedstartTime} - ${formattedendTime}`);
    // startTime.setHours(startTime.getHours() + 1);
    startTime++;
  }

  return times;
}

export function checkcompanionSlotsAvailable(
  companionSlots: AvailableTimeSlotBigInt[],
  bookingdate: string,
  bookingduration: number,
) {
  const startTime = new Date(bookingdate).setHours(
    new Date(bookingdate).getHours(),
  );
  const endDate = new Date(bookingdate).setHours(
    new Date(bookingdate).getHours() + bookingduration,
  );
  const day = new Date(bookingdate).getDay();
  const isAvailable = companionSlots.some((slot) => {
    return (
      slot.dayOfWeek === day &&
      new Date(startTime).getHours() >=
        new Date(Number(slot.startTime)).getHours() &&
      new Date(endDate).getHours() <= new Date(Number(slot.endTime)).getHours()
    );
  });
  return isAvailable;
}
