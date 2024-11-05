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
import { CompanionDescriptionEnum, GenderEnum } from 'src/dto/user.dto';

export const validateregisterUser = (
  userinfo: registerBodyDto,
): returnRegisterUserDto => {
  const { firstname, lastname, email, password, gender, isCompanion, age } =
    userinfo;
  const location = {
    city: userinfo?.city && userinfo.city.trim(),
    zipcode: userinfo?.zipcode && userinfo?.zipcode.trim(),
    lat: userinfo?.lat && userinfo.lat.trim(),
    lng: userinfo?.lng && userinfo.lng.trim(),
  };
  try {
    if (userinfo.description) {
      const tempdesc = JSON.parse(userinfo.description as any);
      userinfo['description'] = Array.isArray(tempdesc) ? tempdesc.map((l) => l.trim()) : []
    }
  } catch (error) {
    console.log("Error JSON in description", error, userinfo.description)
    return {
      error: { status: 422, message: 'Companion description is not valid' },
    };
  }
  const companion = {
    Skintone: userinfo?.skintone && userinfo?.skintone.trim(),
    description: userinfo?.description,
    bookingrate: userinfo?.bookingrate && userinfo?.bookingrate.trim(),
    height: userinfo?.height && userinfo?.height.trim().length,
    bodytype: userinfo?.bodytype && userinfo?.bodytype.trim()
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
  } else if (!age || !age.trim().length) {
    return { error: { status: 422, message: 'Age is required' } };
  } else if (age && Number(age) < 18) {
    return { error: { status: 422, message: 'Below 18 is not allowed' } };
  } else if (!GenderEnum[gender]) {
    return { error: { status: 422, message: 'Gender is not valid' } };
  } else if (!Object.values(location).some((l) => l)) {
    return { error: { status: 422, message: 'Location is required' } };
  } else if (isCompanion && !companion.Skintone) {
    return {
      error: { status: 422, message: 'Companion skintone is required' },
    };
  } else if (isCompanion && !companion.bodytype) {
    return {
      error: { status: 422, message: 'Companion bodytype is required' },
    };
  } else if (isCompanion && !Array.isArray(companion.description)) {
    return {
      error: { status: 422, message: 'Companion description is required' },
    };
  } else if (
    isCompanion &&
    companion.description.length &&
    !companion.description.every((l) => CompanionDescriptionEnum[l])
  ) {
    console.log("Error in valid description", companion.description, companion.description.every((l) => CompanionDescriptionEnum[l]))
    return {
      error: { status: 422, message: 'Companion description is not valid' },
    };
  } else if (isCompanion && !companion.bookingrate) {
    return {
      error: { status: 422, message: 'Companion bookingrate is required' },
    };
  } else if (isCompanion && !companion.height) {
    return {
      error: { status: 422, message: 'Companion height is required' },
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
