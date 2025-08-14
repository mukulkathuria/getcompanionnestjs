import { Companion, User } from 'src/schema/app/generated/prisma/client';
import { errorDto } from './common.dto';
import { coordinatesDto } from './location.dto';

export interface CompanionFindReturnDto extends errorDto {
  data?: Companion[];
}
export interface CompanionDistanceDto extends coordinatesDto {
  id: string;
  companiondata: Companion;
  images: string[];
  firstname: string;
}

export interface companionfiltersDto {
  skintone?: string;
  bodytype?: string;
  minAge?: string;
  maxAge?: string;
}

export interface userCompanionFindLocationInputDto {
  lat: number;
  lng: number;
  city: string;
  gender: string;
  state: string;
  filters?: companionfiltersDto
}

export interface companionDetailsQuery {
  companionId: string;
}
