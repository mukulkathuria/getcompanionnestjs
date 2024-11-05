import * as dayjs from 'dayjs';
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
  // var R = 6.371; // km
  const R = 6371000;
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
