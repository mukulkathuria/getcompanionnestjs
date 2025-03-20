// import { ManipulateType } from 'dayjs';
// import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { updateextensionbokingInputDto } from 'src/dto/bookings.dto';
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
  // const endTime = sessiondetails.endtime.split(' ')[0];
  // const endHour = sessiondetails.endtime.split(' ')[1];
  // if (!sessiondetails.sessionid || !sessiondetails.sessionid.trim().length) {
  //   return { error: { status: 422, message: 'Session Id is required' } };
  // } else if (!sessiondetails.endtime || !sessiondetails.endtime.trim().length) {
  //   return { error: { status: 422, message: 'EndTime is required' } };
  // } else if (
  //   !endTime ||
  //   isNaN(Number(endTime)) ||
  //   (endHour != 'HOUR' && endHour != 'MINUTE')
  // ) {
  //   return { error: { status: 422, message: 'End Time is not valid' } };
  // }
  // const hourend: ManipulateType = endHour === 'HOUR' ? 'hour' : 'minute'
  // return {
  //   data: {
  //     ...sessiondetails,
  //     endTime: Number(endTime),
  //     endHour: hourend,
  //   },
  // };
  if (
    !sessiondetails.bookingid ||
    typeof sessiondetails.bookingid !== 'number'
  ) {
    return { error: { status: 422, message: 'Booking Id is required' } };
  } else if (
    !sessiondetails.extentedhours ||
    typeof sessiondetails.extentedhours !== 'number'
  ) {
    return { error: { status: 422, message: 'Extention is required' } };
  }
  return { success: true };
};

export function validateUpdateExtensionBooking(
  input: updateextensionbokingInputDto,
) {
  if (!input.bookingid || typeof input.bookingid !== 'number') {
    return { error: { status: 422, message: 'Booking id  is required' } };
  }

  if (
    input.extendedhours === undefined ||
    input.extendedhours === null ||
    typeof input.extendedhours !== 'number'
  ) {
    return { error: { status: 422, message: 'extendedhours is required' } };
  }

  if (
    input.extentedfinalrate === undefined ||
    input.extentedfinalrate === null ||
    typeof input.extentedfinalrate !== 'number'
  ) {
    return { error: { status: 422, message: 'extentedfinalrate is required' } };
  }

  // Optional fields check (if provided, they must not be empty)
  else if (input.updatedLocation && !input.updatedLocation.name.trim().length) {
    return { error: { status: 422, message: 'Booking place is required' } };
  } else if (
    input.updatedLocation &&
    !input.updatedLocation.formattedaddress.trim().length
  ) {
    return { error: { status: 422, message: 'Booking address is required' } };
  } else if (
    input.updatedLocation &&
    (!input?.updatedLocation?.city?.trim().length ||
      !input.updatedLocation?.lat ||
      !input.updatedLocation?.lng)
  ) {
    return {
      error: { status: 422, message: 'Booking Location is required' },
    };
  } else if (
    input.updatedLocation &&
    input.updatedLocation.googleextra &&
    typeof input.updatedLocation.googleextra !== 'object'
  ) {
    return { error: { status: 422, message: 'Google parameter is not valid' } };
  }

  if (input.updatedPurpose && input.updatedPurpose.trim() === '') {
    return {
      error: { status: 422, message: 'updatedPurpose cannot be empty' },
    };
  }

  return { success: true };
}
