import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
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
): controllerReturnDto => {
  if (!sessiondetails.sessionid || !sessiondetails.sessionid.trim().length) {
    return { error: { status: 422, message: 'Session Id is required' } };
  } else if (!sessiondetails.endtime || !sessiondetails.endtime.trim().length) {
    return { error: { status: 422, message: 'EndTime is required' } };
  } else if (
    !dayjs(sessiondetails.endtime, 'MM-DD-YYYY HH:mm:ss', true).isValid()
  ) {
    return { error: { status: 422, message: 'End Time is not valid' } };
  }
  return { success: true };
};
