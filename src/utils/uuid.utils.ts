import { randomBytes } from "crypto";

export const uuid = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


export const getTxnId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomString = randomBytes(3).toString('hex');
  return `${randomString}${timestamp}`;
}