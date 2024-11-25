import { EmailRegex } from 'src/constants/regex.constants';
import { GenderEnum, registercompanionInputDto } from 'src/dto/user.dto';

export function validateCompanionRequestInput(userinfo: registercompanionInputDto) {
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
  }else if(!/^\d+$/.test(userinfo.phoneno) && userinfo.phoneno.length != 10){
    return { error:{ status: 422, message: 'Phone no is not valid' } }
  }
}
