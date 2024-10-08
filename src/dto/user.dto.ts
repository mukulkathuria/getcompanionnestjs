export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum CompanionBookingUnitEnum {
  PERHOUR = 'PERHOUR',
  PERMINUTE = 'PERMINUTE',
}

export enum CompanionDescriptionEnum {
  CASUAL_COMPANIONSHIP = 'CASUAL_COMPANIONSHIP',
  COFFEEANDCONVERSATIONS = 'COFFEEANDCONVERSATIONS',
  MOVIES = 'MOVIES',
  CITY_TOURS = 'CITY_TOURS',
  DINING_PARTNER = 'DINING_PARTNER',
  ADVANTURE_COMPANIONSHIP = 'ADVANTURE_COMPANIONSHIP',
  HIKING_BUDDY = 'HIKING_BUDDY',
  BEACHANDWATER_SPORTS = 'BEACHANDWATER_SPORTS',
  CAMPING_TRIPS = 'CAMPING_TRIPS',
  ROAD_TRIPS = 'ROAD_TRIPS',
  SOCIAL_COMPANIONSHIP = 'SOCIAL_COMPANIONSHIP',
  EVENT_PLUSONE = 'EVENT_PLUSONE',
  PARTY_PARTNER = 'PARTY_PARTNER',
  BUSSINESS_NETWORKING = 'BUSSINESS_NETWORKING',
  CULTURAL_OUTINGS = 'CULTURAL_OUTINGS',
  LIFESTYLE_COMPANIONSHIP = 'LIFESTYLE_COMPANIONSHIP',
  FITNESS_PARTNER = 'FITNESS_PARTNER',
  SHOPPING_BUDDY = 'SHOPPING_BUDDY',
  COOKING_COMPANION = 'COOKING_COMPANION',
  LANGUAGE_EXCHANGE = 'LANGUAGE_EXCHANGE',
  PERSONALIZED_EXPERIENCE = 'PERSONALIZED_EXPERIENCE',
  TRAVEL_BUDDY = 'TRAVEL_BUDDY',
  PET_LOVER_COMPANION = 'PET_LOVER_COMPANION',
  UNIQUE_REQUESTS = 'UNIQUE_REQUESTS',
}
export interface UpdateUserProfileBodyDto {
  firstname?: string;
  lastname?: string;
  Images?: string[];
  city?: string;
  zipcode?: string;
  lat?: string;
  lng?: string;
  bookingrate?: string;
  age?: string;
  height?: string;
}

export interface UpdateCompanionProfileBodyDto {
  firstname?: string;
  lastname?: string;
  Images?: string[];
  description?: CompanionDescriptionEnum[];
  skintone?: string;
  city?: string;
  zipcode?: string;
  lat?: string;
  lng?: string;
  bookingrate?: string;
  age?: string;
  height?: string;
}

export interface UserlocationProfileDto{
  city?: string;
  zipcode?: number;
  lat?: number;
  lng?: number;
}

export interface UserCompanionProfileDto{
  bookingrate?: number;
  description?: string[];
  skintone?: string;
}

export interface UserProfileParamsDto {
  id: string;
}
