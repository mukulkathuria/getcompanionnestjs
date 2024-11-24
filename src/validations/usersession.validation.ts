import { ManipulateType } from 'dayjs';
// import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { controllerReturnDto } from 'src/dto/common.dto';
import {
  SessionExtendBodyParamsDto,
  SessionIdBodyParamsDto,
  StartBookingBodyparamsDto,
} from 'src/dto/usersession.dto';

export const checkValidStartSessionData = (
  sessiondetails: StartBookingBodyparamsDto,
): controllerReturnDto => {
  if (
    !sessiondetails.bookingid ||
    typeof sessiondetails.bookingid !== 'number'
  ) {
    return { error: { status: 422, message: 'Booking Id is required' } };
  } else if (!sessiondetails.otp || typeof sessiondetails.otp !== 'number') {
    return { error: { status: 422, message: 'OTP is required' } };
  }
  return { success: true };
};

export const checkValidEndSessionData = (
  sessiondetails: SessionIdBodyParamsDto,
): controllerReturnDto => {
  if (!sessiondetails.sessionid || !sessiondetails.sessionid.trim().length) {
    return { error: { status: 422, message: 'Session Id is required' } };
  }
  return { success: true };
};

export const checkValidExtendSessionData = (
  sessiondetails: SessionExtendBodyParamsDto,
) => {
  const endTime = sessiondetails.endtime.split(' ')[0];
  const endHour = sessiondetails.endtime.split(' ')[1];
  if (!sessiondetails.sessionid || !sessiondetails.sessionid.trim().length) {
    return { error: { status: 422, message: 'Session Id is required' } };
  } else if (!sessiondetails.endtime || !sessiondetails.endtime.trim().length) {
    return { error: { status: 422, message: 'EndTime is required' } };
  } else if (
    !endTime ||
    isNaN(Number(endTime)) ||
    (endHour != 'HOUR' && endHour != 'MINUTE')
  ) {
    return { error: { status: 422, message: 'End Time is not valid' } };
  }
  const hourend: ManipulateType = endHour === 'HOUR' ? 'hour' : 'minute'
  return {
    data: {
      ...sessiondetails,
      endTime: Number(endTime),
      endHour: hourend,
    },
  };
};
