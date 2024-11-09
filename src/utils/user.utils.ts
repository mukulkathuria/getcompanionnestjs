import { Companion, User } from '@prisma/client';
import { CompanionDetailsDto } from 'src/dto/user.dto';

export const filterCompanionDetailsbyuser = (
  companionDetails: Companion,
  userDetails: User,
): CompanionDetailsDto => {
  const finaldata = {
    id: userDetails.id,
    bookingrate: companionDetails.bookingrate,
    bookingrateunit: companionDetails.bookingrateunit,
    description: companionDetails.description,
    Skintone: companionDetails.Skintone,
    height: companionDetails.height,
    bodytype: companionDetails.bodytype,
    age: userDetails.age,
    firstname: userDetails.firstname,
    lastname: userDetails.lastname,
    gender: userDetails.gender,
    images: userDetails.Images,
  };
  return finaldata;
};
