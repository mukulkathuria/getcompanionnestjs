import { errorDto, successErrorDto } from './common.dto';
import { GenderEnum } from './user.dto';

export type registerBodyDto = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isCompanion?: boolean;
  Images?: string[];
  description?: string;
  skintone?: string;
  gender: GenderEnum;
  city?: string;
  zipcode?: number;
  lat?: number;
  lng?: number;
  bookingrate?: number
};

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
}

export interface forgotPasswordDto {
  token: string;
  password: string;
}

export interface loginUserDto extends successErrorDto, userTokenDto {}

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
}
