import { EmailRegex, PasswordRegex } from 'src/constants/regex.constants';
import { Jwt } from 'src/tokens/Jwt';
import {
  loginBodyDto,
  registerBodyDto,
  returnLoginUserDto,
  returnRegisterUserDto,
  refreshTokenParamsDto,
} from 'src/dto/auth.module.dto';
import { decryptRefreshToken } from 'src/utils/crypt.utils';
import { decodeRefreshToken } from 'src/guards/strategies/jwt.strategy';
import { GenderEnum } from 'src/dto/user.dto';

export const validateregisterUser = (
  userinfo: registerBodyDto,
): returnRegisterUserDto => {
  const { firstname, lastname, email, password, gender, isCompanion } =
    userinfo;
  const location = {
    city: userinfo?.city && userinfo.city.trim(),
    zipcode: userinfo?.zipcode,
    lat: userinfo?.lat,
    lng: userinfo?.lng,
  };
  const companion = {
    Skintone: userinfo?.skintone && userinfo?.skintone.trim(),
    description: userinfo?.description && userinfo?.description.trim(),
    bookingrate: userinfo?.bookingrate,
  };
  if (!firstname || !firstname.trim().length) {
    return { error: { status: 422, message: 'First name is required' } };
  } else if (!lastname || !lastname.trim().length) {
    return { error: { status: 422, message: 'Last name is required' } };
  } else if (!email || !email.trim().length) {
    return { error: { status: 422, message: 'Email is required' } };
  } else if (!EmailRegex.test(email)) {
    return { error: { status: 422, message: 'Email is not valid' } };
  } else if (!password || !password.trim().length) {
    return { error: { status: 422, message: 'Password is required' } };
  } else if (!PasswordRegex.test(password)) {
    return { error: { status: 422, message: 'Password is not valid' } };
  } else if (!gender || !gender.trim().length) {
    return { error: { status: 422, message: 'Gender is required' } };
  } else if (!GenderEnum[gender]) {
    return { error: { status: 422, message: 'Gender is not valid' } };
  } else if (!Object.values(location).some((l) => l)) {
    return { error: { status: 422, message: 'Location is required' } };
  } else if (
    (location.zipcode && typeof location.zipcode !== 'number') ||
    (location.lat && typeof location.lat !== 'number') ||
    (location.lng && typeof location.lng !== 'number')
  ) {
    return { error: { status: 422, message: 'User location is not valid' } };
  } else if (isCompanion && !companion.Skintone) {
    return {
      error: { status: 422, message: 'Companion skintone is required' },
    };
  } else if (isCompanion && !companion.description) {
    return {
      error: { status: 422, message: 'Companion description is required' },
    };
  } else if (isCompanion && !companion.bookingrate) {
    return {
      error: { status: 422, message: 'Companion bookingrate is required' },
    };
  }
  return { user: userinfo };
};

export const validateLoginUser = (
  userinfo: loginBodyDto,
): returnLoginUserDto => {
  const { email, password } = userinfo;
  if (!email || !email.trim().length) {
    return { error: { status: 422, message: 'Email is required' } };
  } else if (!EmailRegex.test(email)) {
    return { error: { status: 422, message: 'Email is not valid' } };
  } else if (!password || !password.trim().length) {
    return { error: { status: 422, message: 'Password is required' } };
  }
  return { user: userinfo };
};

export const refreshTokenValidate = (token: refreshTokenParamsDto) => {
  const { refresh_token } = token;
  if (!refresh_token || !refresh_token.trim().length) {
    return { error: { status: 422, message: 'Refresh token is required' } };
  }

  const { token: refreshToken, error } = decryptRefreshToken(refresh_token);
  if (error) {
    return { error: { status: 403, message: error } };
  } else if (refreshToken.split('.').length < 3) {
    return { error: { status: 403, message: 'Invalid token' } };
  }

  const { data, error: decodedErr } = decodeRefreshToken(refreshToken);
  if (decodedErr) {
    return { error: { status: 403, message: 'Invalid Token' } };
  }

  const { error: jwtErr } = Jwt.checkValidRefreshToken(data);
  if (jwtErr) {
    return { error: { status: 403, message: jwtErr } };
  }

  return { token: data };
};
