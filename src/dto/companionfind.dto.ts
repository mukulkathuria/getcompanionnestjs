import { Companion } from '@prisma/client';
import { errorDto } from './common.dto';
import { coordinatesDto } from './location.dto';

export interface CompanionFindReturnDto extends errorDto {
  data?: Companion[];
}
export interface CompanionDistanceDto extends coordinatesDto {
  id: string;
  companiondata: Companion;
}

export interface userCompanionFindLocationInputDto {
  lat: number;
  lng: number;
  city: string;
}
