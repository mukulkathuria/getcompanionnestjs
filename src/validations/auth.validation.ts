import { EmailRegex, PasswordRegex } from 'src/constants/regex.constants';
import { Jwt } from 'src/tokens/Jwt';
import {
  loginBodyDto,
  registerBodyDto,
  returnLoginUserDto,
  returnRegisterUserDto,
  refreshTokenParamsDto,
  registerCompanionBodyDto,
} from 'src/dto/auth.module.dto';
import { decryptRefreshToken } from 'src/utils/crypt.utils';
import { decodeRefreshToken } from 'src/guards/strategies/jwt.strategy';
import {
  CompanionDescriptionEnum,
  CompanionDrinkingHabitEnum,
  CompanionEatingHabitsEnum,
  CompanionSkinToneEnum,
  CompanionSmokingHabitEnum,
  FemaleCompanionBodyTypeEnum,
  GenderEnum,
  MaleCompanionBodyTypeEnum,
} from 'src/dto/user.dto';
import { User } from '@prisma/client';

export const validateregisterUser = (
  userinfo: registerBodyDto,
): returnRegisterUserDto => {
  const { firstname, lastname, email, password, gender, age } = userinfo;
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
  }
  return { user: userinfo };
};

export function validateregisterCompanion(userinfo: registerCompanionBodyDto) {
  const { firstname, lastname, email, password, gender, age } = userinfo;
  const location = {
    city: userinfo?.city && userinfo.city.trim(),
    zipcode: userinfo?.zipcode && userinfo?.zipcode.trim(),
    lat: userinfo?.lat && userinfo.lat.trim(),
    lng: userinfo?.lng && userinfo.lng.trim(),
  };
  try {
    if (userinfo.description) {
      const tempdesc = JSON.parse(userinfo.description as any);
      userinfo['description'] = Array.isArray(tempdesc)
        ? tempdesc.map((l) => l.trim())
        : [];
    }
  } catch (error) {
    console.log('Error JSON in description', error, userinfo.description);
    return {
      error: { status: 422, message: 'Companion description is not valid' },
    };
  }
  const companion = {
    Skintone: userinfo?.skintone && userinfo?.skintone.trim(),
    description: userinfo?.description,
    bookingrate: userinfo?.bookingrate && userinfo?.bookingrate.trim(),
    height: userinfo?.height && userinfo?.height.trim().length,
    bodytype: userinfo?.bodytype && userinfo?.bodytype.trim(),
    eatinghabits: userinfo?.eatinghabits && userinfo?.eatinghabits.trim(),
    drinkinghabits: userinfo?.drinkinghabits && userinfo?.drinkinghabits.trim(),
    smokinghabits: userinfo?.smokinghabits && userinfo?.smokinghabits.trim(),
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
  } else if (!companion.Skintone) {
    return {
      error: { status: 422, message: 'Companion skintone is required' },
    };
  } else if (!CompanionSkinToneEnum[companion.Skintone]) {
    return {
      error: { status: 422, message: 'Companion skintone is not valid' },
    };
  } else if (!companion.eatinghabits) {
    return {
      error: { status: 422, message: 'Companion eating habits is required' },
    };
  } else if (!CompanionEatingHabitsEnum[companion.eatinghabits]) {
    return {
      error: { status: 422, message: 'Companion eating habits is not valid' },
    };
  } else if (!companion.drinkinghabits) {
    return {
      error: { status: 422, message: 'Companion drinking habits is required' },
    };
  } else if (!CompanionDrinkingHabitEnum[companion.drinkinghabits]) {
    return {
      error: { status: 422, message: 'Companion drinking habits is not valid' },
    };
  } else if (!companion.smokinghabits) {
    return {
      error: { status: 422, message: 'Companion smoking habits is required' },
    };
  } else if (!CompanionSmokingHabitEnum[companion.smokinghabits]) {
    return {
      error: { status: 422, message: 'Companion smoking habits is not valid' },
    };
  } else if (!companion.bodytype) {
    return {
      error: { status: 422, message: 'Companion bodytype is required' },
    };
  } else if (
    (GenderEnum[userinfo.gender] === 'MALE' &&
      !MaleCompanionBodyTypeEnum[userinfo.bodytype]) ||
    (GenderEnum[userinfo.gender] === 'FEMALE' &&
      !FemaleCompanionBodyTypeEnum[userinfo.bodytype]) ||
    (GenderEnum[userinfo.gender] === 'OTHER' &&
      (MaleCompanionBodyTypeEnum[userinfo.bodytype] ||
        FemaleCompanionBodyTypeEnum[userinfo.bodytype]))
  ) {
    return {
      error: { status: 422, message: 'Companion bodytype is not valid' },
    };
  } else if (!Array.isArray(companion.description)) {
    return {
      error: { status: 422, message: 'Companion description is required' },
    };
  } else if (
    companion.description.length &&
    !companion.description.every((l) => CompanionDescriptionEnum[l])
  ) {
    console.log(
      'Error in valid description',
      companion.description,
      companion.description.every((l) => CompanionDescriptionEnum[l]),
    );
    return {
      error: { status: 422, message: 'Companion description is not valid' },
    };
  } else if (!companion.bookingrate) {
    return {
      error: { status: 422, message: 'Companion bookingrate is required' },
    };
  } else if (!companion.height) {
    return {
      error: { status: 422, message: 'Companion height is required' },
    };
  }
  return { user: userinfo };
}

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

export const basicuservalidationforuserExists = (
  userDetails: User,
  isregistration: boolean = false,
) => {
  if (!isregistration) {
    if (!userDetails) {
      return { error: { status: 422, message: 'Invalid Credentials' } };
    } else if (
      userDetails &&
      userDetails.isDeleted &&
      userDetails.expiryDate < Date.now()
    ) {
      return {
        error: {
          status: 401,
          message: 'Account Deleted!. Please contact admin',
        },
      };
    }
  } else if (isregistration) {
    if (
      userDetails &&
      userDetails.isDeleted &&
      userDetails.expiryDate < Date.now()
    ) {
      return {
        error: {
          status: 422,
          message:
            'Your Account has been expired please register with new one.',
        },
      };
    } else if (userDetails) {
      return { error: { status: 422, message: 'User already exists' } };
    }
  }
  return { success: true };
};
