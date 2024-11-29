import * as dayjs from 'dayjs';
import { CompanionDistanceDto } from 'src/dto/companionfind.dto';
import { coordinatesDto } from 'src/dto/location.dto';

export const addDays = (days: number, date?: Date): Date => {
  if (date) {
    return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
  }
};

export const subDays = (days: number): any => {
  const date = dayjs();
  date.subtract(days, 'days');
  date.set('hour', 0);
  date.set('minute', 0);
  date.set('second', 0);
  return dayjs(date).format();
};

function toRad(Value: number) {
  return (Value * Math.PI) / 180;
}

export function calCordinateDistance(
  coords1: coordinatesDto,
  coords2: coordinatesDto,
) {
  const R = 6371;
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export function createOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

export function getdefaultexpirydate(): number {
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  return tenYearsFromNow.getTime();
}

export function getdeletedUserexpirydate(): number {
  const thirtysixhoursnornow = new Date();
  thirtysixhoursnornow.setHours(thirtysixhoursnornow.getHours() + 36);
  return thirtysixhoursnornow.getTime();
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortCompanion(
  userLocation: coordinatesDto,
  companions: CompanionDistanceDto[],
) {
  const userDetails = {
    lat: userLocation.lat,
    long: userLocation.lng,
  };
  const companionwithdistances = companions.map((l) => ({
    ...l,
    distance: haversine(userDetails.lat, userDetails.long, l.lat, l.lng),
  }));
  const sortedOnes = companionwithdistances.sort((a, b) => {
    return a.distance - b.distance;
  });
  return sortedOnes.map((l) => ({ ...l.companiondata, distance: l.distance }));
}

export function addHours(hour: number, hourorminute? : dayjs.ManipulateType){
  return dayjs().add(hour, hourorminute || 'hour').valueOf()
}

export function convertToDateTime(date: bigint){
  return dayjs(Number(date)).format("DD/MM/YYYY HH:mm")
}