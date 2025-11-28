export function getearningofCompanionQuery(companionId: string) {
    return `
        WITH companion_bookings AS (
        SELECT 
            b.*,
            u.firstname,
            u.lastname,
            u.email,
            u."Images" as user_images
        FROM "Booking" b
        JOIN "_BookingToUser" btu ON b.id = btu."A"
        JOIN "User" u ON btu."B" = u.id
        WHERE EXISTS (
            SELECT 1 FROM "Companion" c WHERE c.userid = '${companionId}'
        )
        AND b.bookingstatus IN ('COMPLETED', 'ACCEPTED', 'UNDERREVIEW', 'TRANSACTIONPENDING', 'UNDEREXTENSION')
        AND u.id != '${companionId}' -- This gets the user (customer), not the companion
        ),

        total_bookings_hours AS (
        SELECT 
            COALESCE(SUM(
            CASE 
                WHEN companion_bookings."bookingdurationUnit" = 'HOUR' THEN (companion_bookings."bookingend" / 1000 - companion_bookings."bookingstart" / 1000) / 3600
                WHEN companion_bookings."bookingdurationUnit" = 'MINUTE' THEN (companion_bookings."bookingend" / 1000 - companion_bookings."bookingstart" / 1000 / 3600) / 60.0
                ELSE 0
            END
            ), 0) as total_hours
        FROM companion_bookings
        ),

        average_rating AS (
        SELECT 
            CASE 
            WHEN COUNT(r.ratings) > 0 THEN
                -- Bayesian average: (v * R + m * C) / (v + m)
                -- where v = number of votes, R = average rating, m = minimum votes needed (5), C = mean rating across platform (3.5)
                (COUNT(r.ratings) * AVG(r.ratings::numeric) + 5 * 3.5) / (COUNT(r.ratings) + 5)
            ELSE 0
            END as bayesian_avg_rating
        FROM companion_bookings cb
        LEFT JOIN rating r ON cb.id = r."bookingId" AND r."rateeId" = '${companionId}'
        ),

        total_earnings AS (
        SELECT 
            COALESCE(SUM(tl."netAmount"), 0) as total_earning
        FROM "TransactionLedger" tl
        WHERE tl."toCompanionId" = '${companionId}' 
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status = 'COMPLETED'
        ),

        last_week_earnings AS (
        SELECT 
            COALESCE(SUM(tl."netAmount"), 0) as last_week_earning
        FROM "TransactionLedger" tl
        WHERE tl."toCompanionId" = '${companionId}' 
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status = 'COMPLETED'
            AND tl."createdAt" >= NOW() - INTERVAL '7 days'
        ),

        daily_hours_last_week AS (
        SELECT 
            json_agg(
            json_build_object(
                'day', day_name,
                'hours', COALESCE(total_day_hours, 0)
            ) ORDER BY day_order
            ) as daily_hours
        FROM (
            SELECT 
            CASE EXTRACT(DOW FROM date_series)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_name,
            EXTRACT(DOW FROM date_series) as day_order,
            SUM(
                CASE 
                WHEN cb."bookingdurationUnit" = 'HOUR' THEN cb."bookingduration"
                WHEN cb."bookingdurationUnit" = 'MINUTE' THEN cb."bookingduration" / 60.0
                ELSE 0
                END
            ) as total_day_hours
            FROM (
            SELECT generate_series(
                DATE_TRUNC('day', NOW() - INTERVAL '6 days'),
                DATE_TRUNC('day', NOW()),
                '1 day'::interval
            ) as date_series
            ) dates
            LEFT JOIN companion_bookings cb ON DATE_TRUNC('day', TO_TIMESTAMP(cb.bookingstart / 1000.0)) = DATE_TRUNC('day', date_series)
            GROUP BY date_series, EXTRACT(DOW FROM date_series)
        ) daily_data
        ),

        last_month_earnings AS (
        SELECT 
            COALESCE(SUM(tl."netAmount"), 0) as last_month_earning
        FROM "TransactionLedger" tl
        WHERE tl."toCompanionId" = '${companionId}'
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status = 'COMPLETED'
            AND tl."createdAt" >= NOW() - INTERVAL '30 days'
        ),

        last_100_earnings AS (
        SELECT 
            COALESCE(SUM(recent_transactions."netAmount"), 0) as last_100_earning
        FROM (
            SELECT tl."netAmount"
            FROM "TransactionLedger" tl
            WHERE tl."toCompanionId" = '${companionId}'
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status = 'COMPLETED'
            ORDER BY tl."createdAt" DESC
            LIMIT 100
        ) recent_transactions
        ),

        recent_earnings AS (
        SELECT 
            COALESCE(
            json_agg(
                json_build_object(
                'amount', recent_data."netAmount",
                'tax_amount', recent_data."taxAmount",
                'penalty_amount', recent_data."penaltyAmount",
                'platform_fee', recent_data."platformFee",
                'txn_id', recent_data."txnId",
                'booking_start', recent_data.bookingstart,
                'booking_end', recent_data.bookingend,
                'booking_id', recent_data.id,
                'user_details', json_build_object(
                    'firstname', recent_data.firstname,
                    'lastname', recent_data.lastname,
                    'email', recent_data.email,
                    'images', recent_data.user_images
                ),
                'transaction_date', EXTRACT(EPOCH FROM recent_data."createdAt") * 1000,
                'booking_duration', recent_data.bookingduration,
                'booking_duration_unit', recent_data."bookingdurationUnit"
                ) ORDER BY recent_data."createdAt" DESC
            ), 
            '[]'::json
            ) as recent_earnings_data
        FROM (
            SELECT DISTINCT ON (tl.id) 
            tl."netAmount",
            tl."txnId",
            tl."taxAmount",
            tl."penaltyAmount",
            tl."platformFee",
            tl."createdAt" as transaction_created_at,
            b.*,
            u.firstname,
            u.lastname,
            u.email,
            u."Images" as user_images
            FROM "TransactionLedger" tl
            JOIN "Booking" b ON tl."bookingId" = b.id
            JOIN "_BookingToUser" btu ON b.id = btu."A"
            JOIN "User" u ON btu."B" = u.id::text
            WHERE tl."toCompanionId" = '${companionId}'
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status = 'COMPLETED'
            ORDER BY tl.id, tl."createdAt" DESC
            LIMIT 5
        ) recent_data
        ),

        pending_amount AS (
        SELECT 
            COALESCE(SUM(tl."netAmount"), 0) as pending_amount
        FROM "TransactionLedger" tl
        WHERE tl."toCompanionId" = '${companionId}' 
            AND tl."transactionType" = 'PAYMENT_TO_COMPANION'
            AND tl.status IN ('UNDERPROCESSED', 'COMPLETED')
            AND tl."isSettled" = false
        ),

        penalty_charges AS (
        SELECT 
            COALESCE(SUM(tl."penaltyAmount"), 0) as total_penalty
        FROM "TransactionLedger" tl
        WHERE tl."fromUserId" = '${companionId}' 
            AND tl."transactionType" = 'CANCELLATION_PENALTY'
            AND tl.status = 'COMPLETED'
        )

        SELECT 
        tbh.total_hours as total_booking_hours,
        ROUND(ar.bayesian_avg_rating::numeric, 2) as average_rating,
        te.total_earning,
        lwe.last_week_earning,
        dhlw.daily_hours as earnings_last_week_by_days,
        lme.last_month_earning,
        l100e.last_100_earning,
        re.recent_earnings_data as recent_earnings,
        pa.pending_amount,
        pc.total_penalty as penalty_charges
        FROM total_bookings_hours tbh,
            average_rating ar,
            total_earnings te,
            last_week_earnings lwe,
            daily_hours_last_week dhlw,
            last_month_earnings lme,
            last_100_earnings l100e,
            recent_earnings re,
            pending_amount pa,
            penalty_charges pc;
`
}

export function getCompanionDashboardQuery(companionId: string) {
    return `
       SELECT
    -- 1. This Month Earning
    COALESCE((
        SELECT SUM("netAmount")
        FROM "TransactionLedger"
        WHERE "toCompanionId" = '${companionId}'
        AND "transactionType" = 'PAYMENT_TO_COMPANION'
        AND "status" = 'COMPLETED'
        AND "createdAt" >= DATE_TRUNC('month', NOW())
    ), 0) AS "thisMonthEarning",

    -- 2. Total Pending Balance
    COALESCE((
        SELECT SUM("netAmount")
        FROM "TransactionLedger"
        WHERE "toCompanionId" = '${companionId}'
        AND "isSettled" = false
        AND "status" IN ('COMPLETED', 'UNDERPROCESSED')
    ), 0) AS "totalPendingBalance",

    -- 3. Bayesian Average Rating (m=5)
    COALESCE((
        WITH user_stats AS (
        SELECT COUNT(*) as v, AVG("ratings") as R 
        FROM "rating" 
        WHERE "rateeId" = '${companionId}'
        ),
        global_stats AS (
        SELECT AVG("ratings") as C 
        FROM "rating"
        )
        SELECT 
        CASE 
            WHEN user_stats.v > 0 THEN
            ((user_stats.v * user_stats.R) + (5 * COALESCE(global_stats.C, 0))) / (user_stats.v + 5)
            ELSE 0 
        END
        FROM user_stats, global_stats
    ), 0) AS "rating",

    -- 4. Total Completed Bookings
    (
        SELECT COUNT(DISTINCT b.id)::int
        FROM "Booking" b
        JOIN "_BookingToUser" btu ON b.id = btu."A"
        WHERE btu."B" = '${companionId}'
        AND b."bookingstatus" = 'COMPLETED'
    ) AS "totalCompletedBookings",

    -- 5. Total Upcoming Bookings
    (
        SELECT COUNT(DISTINCT b.id)::int
        FROM "Booking" b
        JOIN "_BookingToUser" btu ON b.id = btu."A"
        WHERE btu."B" = '${companionId}'
        AND b."bookingstatus" IN ('ACCEPTED')
        AND b."bookingstart" > (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
    ) AS "totalUpcomingBookings",

    (
        SELECT json_build_object(
            'id', c.id,
            'firstname', c.firstname,
            'lastname', c.lastname,
            'images', c."Images",
            'isavailable', ca."isAvailable"
        )
        FROM "User" c
        INNER JOIN "Companion" u ON c.id = u."userid"
        INNER JOIN "CompanionAvailability" ca ON u.id = ca."companionId"
        WHERE c.id = '${companionId}'
    ) AS "companionDetails",

    COALESCE((
        SELECT json_agg(row_to_json(upcoming_data))
        FROM (
        SELECT 
            u."firstname" || ' ' || u."lastname" AS "name",
            u."Images" AS "images",
            u.age AS "age",
            b."bookingstart" AS "startTime",
            b."bookingend" AS "endTime", 
        FROM "Booking" b
        JOIN "_BookingToUser" companion_link ON b.id = companion_link."A" AND companion_link."B" = '${companionId}'
        JOIN "_BookingToUser" client_link ON b.id = client_link."A" AND client_link."B" != '${companionId}'
        JOIN "User" u ON client_link."B" = u."id"
        WHERE 
            b."bookingstatus" IN ('ACCEPTED')
            AND b."bookingstart" > (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
        ORDER BY b."bookingstart" ASC
        LIMIT 5
        ) upcoming_data
    ), '[]'::json) AS "upcomingBookingsList";
    `;
}
