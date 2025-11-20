import { EmailRegex, phoneRegex } from 'src/constants/regex.constants';
import { statusUpdateInputDto } from 'src/dto/admin.module.dto';
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
import { bookingLocationValidation } from './booking.validation';
import { bookinglocationPrismaDto } from 'src/dto/bookings.dto';
import { PaymentMethodService, PaymentMethodValidator } from './userpaymentmethod.validation';
import { PaymentMethodInput } from 'src/dto/userpaymentmethod.dto';

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
  return { success: true };
}

export function validatecompanionupdaterequest(
  userinfo: CompanionUpdateRequestInputDto,
) {
  const { firstname, lastname, age, phoneno } = userinfo;
  try {
    if (userinfo.description) {
      const tempdesc = JSON.parse(userinfo.description as any);
      const temppreviousImges = userinfo.previousImages
        ? JSON.parse(userinfo.previousImages as any)
        : [];
      const tempbaseloc = JSON.parse(userinfo.baselocations as any);
      const temppaymentmethod = JSON.parse(userinfo.paymentmethods as any);
      userinfo.baselocations = tempbaseloc;
      userinfo.previousImages = temppreviousImges;
      userinfo.paymentmethods = temppaymentmethod;
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
    !MaleCompanionBodyTypeEnum[userinfo.bodytype] &&
    !FemaleCompanionBodyTypeEnum[userinfo.bodytype]
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
  } else if (
    userinfo.previousImages &&
    !Array.isArray(userinfo.previousImages)
  ) {
    return {
      error: { status: 422, message: 'Previous images should be an array' },
    };
  } else if (userinfo.baselocations?.length < 4) {
    return {
      error: { status: 422, message: 'Atleast 4 baselocation is required' },
    };
  } else if (!userinfo.paymentmethods.length) {
    return {
      error: { status: 422, message: 'Payment Method is required' },
    };
  } else if (userinfo.paymentmethods.length > 4) {
    return {
      error: {
        status: 422,
        message: 'You cant add more than 4 payment method',
      },
    };
  } else if (!userinfo.bookingrate || !userinfo.bookingrate.trim().length) {
    return {
      error: { status: 422, message: 'Booking rate is required' },
    };
  }
  for (let i = 0; i < userinfo.baselocations.length; i += 1) {
    const { error } = bookingLocationValidation(userinfo.baselocations[i]);
    if (error) {
      return { error };
    }
  }
    for (let i = 0; i < userinfo.paymentmethods.length; i += 1) {
      const { isValid, errors } = PaymentMethodValidator.validate(
        userinfo.paymentmethods[i],
      );
      if (!isValid && errors.length) {
        return {
          error: {
            status: 422,
            message: errors.map((l) => l.message).join(', '),
          },
        };
      }
    }
  const values = [
    'firstname',
    'lastname',
    'previousImages',
    'Images',
    'age',
    'phoneno',
    'description',
    'skintone',
    'height',
    'bodytype',
    'eatinghabits',
    'drinkinghabits',
    'smokinghabits',
  ];
  const keyvalues = {};
  for (const key of values) {
    if (userinfo[key]) {
      keyvalues[key] = userinfo[key];
    }
  }
  const paymentMethodData = [];
  for (let i = 0; i < userinfo.paymentmethods.length; i += 1) {
      const paymentmethod = new PaymentMethodService().prepareDataForDB(
        userinfo.paymentmethods[i],
      );
      paymentMethodData.push(paymentmethod)
    }
  keyvalues['baselocations'] = userinfo.baselocations.map((l) => ({
    city: l.city,
    state: l.state,
    googleformattedadress: l.formattedaddress,
    googleloc: l.name,
    userinput: l.userInput,
    lat: l.lat,
    lng: l.lng,
    googleplaceextra: l.googleextra,
  }));
  keyvalues['paymentmethods'] = paymentMethodData;
  type newRequest = Omit<CompanionUpdateRequestInputDto, 'baselocations' | 'paymentmethods'> & {
    baselocations: bookinglocationPrismaDto[];
    paymentmethods: PaymentMethodInput[]
  };
  return { user: keyvalues as newRequest };
}

export function validateRequestInput(
  requestInput: statusUpdateInputDto,
  idString: string,
) {
  const { id, approve, reject } = requestInput;
  if (!id || !id.trim().length) {
    return { error: { status: 422, message: `${idString} Id is required` } };
  } else if (!approve && !reject) {
    return { error: { status: 422, message: 'Approve or reject is required' } };
  } else if (approve && reject) {
    return { error: { status: 422, message: 'Approve or reject is required' } };
  } else if (approve && typeof approve !== 'boolean') {
    return { error: { status: 422, message: 'Approve is not valid' } };
  } else if (reject && typeof reject !== 'boolean') {
    return { error: { status: 422, message: 'Reject is not valid' } };
  }
  return { success: true };
}
