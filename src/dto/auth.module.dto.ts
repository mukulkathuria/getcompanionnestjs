import { BookingMeetingLocationDto } from './bookings.dto';
import { errorDto, successErrorDto } from './common.dto';
import {
  CompanionDescriptionEnum,
  CompanionDrinkingHabitEnum,
  CompanionEatingHabitsEnum,
  CompanionSkinToneEnum,
  CompanionSmokingHabitEnum,
  FemaleCompanionBodyTypeEnum,
  GenderEnum,
  MaleCompanionBodyTypeEnum,
} from './user.dto';

export type registerBodyDto = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneno: string;
  Images?: string[];
  gender: GenderEnum;
  age: string;
};

export type registerCompanionBodyDto = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  Images?: string[];
  gender: GenderEnum;
  age: string;
  phoneno: string;
  description: CompanionDescriptionEnum[];
  skintone: CompanionSkinToneEnum;
  bookingrate: string;
  height: string;
  bodytype: MaleCompanionBodyTypeEnum | FemaleCompanionBodyTypeEnum;
  eatinghabits: CompanionEatingHabitsEnum;
  drinkinghabits: CompanionDrinkingHabitEnum;
  smokinghabits: CompanionSmokingHabitEnum;
  baselocations: BookingMeetingLocationDto[]
};

export interface previousImagesDto {
  previousImages?: string[];
}

export interface returnRegisterUserDto extends errorDto {
  user?: registerBodyDto;
}

export interface loginBodyDto {
  email: string;
  password: string;
}

export interface returnLoginUserDto extends errorDto {
  user?: loginBodyDto;
}

export interface userTokenDto {
  access_token?: string;
  refresh_token?: string;
}

export interface forgotPasswordInitDto {
  email: string;
  emailverification?: boolean; 
}

export interface forgotPasswordDto {
  OTP: string;
  email: string;
  password: string;
}

export interface loginUserDto extends successErrorDto, userTokenDto {
  isEmailverified?: boolean;
  anybookingdone?: boolean
}

export interface logoutParamsDto {
  email: string;
  reId: string;
}

export type refreshTokenParamsDto = {
  refresh_token: string;
};

export enum AccountEnum {
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

export enum Roles {
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
  COMPANION = 'COMPANION',
  EMPLOYEE = 'EMPLOYEE',
}

export interface sendMailInputDto {
  from?: string;
  to: string;
  subject: string;
  html: string;
}


export interface tokenInputDto {
  token: string;
}