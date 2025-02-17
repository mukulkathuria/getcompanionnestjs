import { EmailRegex, phoneRegex } from 'src/constants/regex.constants';
import {
  CompanionDescriptionEnum,
  CompanionDrinkingHabitEnum,
  CompanionEatingHabitsEnum,
  CompanionSkinToneEnum,
  CompanionSmokingHabitEnum,
  CompanionUpdateRequestInputDto,
  FemaleCompanionBodyTypeEnum,
  GenderEnum,
  MaleCompanionBodyTypeEnum,
  registercompanionInputDto,
} from 'src/dto/user.dto';

export function validateCompanionRequestInput(
  userinfo: registercompanionInputDto,
) {
  const { firstname, lastname, email, gender, age } = userinfo;

  if (!firstname || !firstname.trim().length) {
    return { error: { status: 422, message: 'First name is required' } };
  } else if (!lastname || !lastname.trim().length) {
    return { error: { status: 422, message: 'Last name is required' } };
  } else if (!email || !email.trim().length) {
    return { error: { status: 422, message: 'Email is required' } };
  } else if (!EmailRegex.test(email)) {
    return { error: { status: 422, message: 'Email is not valid' } };
  } else if (!gender || !gender.trim().length) {
    return { error: { status: 422, message: 'Gender is required' } };
  } else if (!age || !age.trim().length) {
    return { error: { status: 422, message: 'Age is required' } };
  } else if (age && Number(age) < 18) {
    return { error: { status: 422, message: 'Below 18 is not allowed' } };
  } else if (!GenderEnum[gender]) {
    return { error: { status: 422, message: 'Gender is not valid' } };
  } else if (!/^\d+$/.test(userinfo.phoneno) && userinfo.phoneno.length != 10) {
    return { error: { status: 422, message: 'Phone no is not valid' } };
  }
  return { success: true }
}

export function validatecompanionupdaterequest(
  userinfo: CompanionUpdateRequestInputDto,
) {
  const { firstname, lastname, age, phoneno } = userinfo;
  const location = {
    city: userinfo?.city && userinfo.city.trim(),
    state: userinfo?.state && userinfo.state.trim(),
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
  } else if (!phoneno || !phoneno.trim().length) {
    return { error: { status: 422, message: 'Number is required' } };
  } else if (!phoneRegex.test(phoneno)) {
    return { error: { status: 422, message: 'Number is not valid' } };
  } else if (!age || !age.trim().length) {
    return { error: { status: 422, message: 'Age is required' } };
  } else if (age && Number(age) < 18) {
    return { error: { status: 422, message: 'Below 18 is not allowed' } };
  } else if (!Object.values(location).every((l) => l)) {
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
    MaleCompanionBodyTypeEnum[userinfo.bodytype] ||
    FemaleCompanionBodyTypeEnum[userinfo.bodytype]
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
  } else if (!companion.height) {
    return {
      error: { status: 422, message: 'Companion height is required' },
    };
  }
  return { user: userinfo };
}
