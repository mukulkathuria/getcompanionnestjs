import { SignOptions } from 'jsonwebtoken';

export const accessTokenConfig: SignOptions = {
  expiresIn: '15m',  // for rgressive testing i have changed to 15mins we haveto change to 1h when final production
  algorithm: 'HS256',
};

export const refreshTokenConfig: SignOptions = {
  expiresIn: '1h', // for rgressive testing i have changed to 1h we haveto change to 8h when final production
  algorithm: 'HS256',
};

export const AccessTokenSecret = 'SECRET';
export const RefreshTokenSecret = 'REFRESH_SECRET';
