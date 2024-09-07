export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum BookingRateUnitEnum {
  PERHOUR = 'PERHOUR',
  PERMINUTE = 'PERMINUTE',
}

export interface UpdateUserProfileBodyDto {
  firstname?: string;
  lastname?: string;
  isCompanion?: boolean;
  Images?: string[];
  description?: string;
  skintone?: string;
  city?: string;
  zipcode?: number;
  lat?: number;
  lng?: number;
  bookingrate?: number;
  age?: number
}

export interface UserProfileParamsDto{
    id: string;
}