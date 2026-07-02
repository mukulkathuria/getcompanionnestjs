export type tokenDto = {
  userId: number;
  isCompanion: boolean;
  Images: string[];
  name: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
  iat: number;
  exp: number;
};

export interface AccessTokenDto extends tokenDto {
  reId: number;
}

export interface RefreshTokenDto extends tokenDto {
  id: number;
}

export type refreshTokenObjDto = {
  [key: string]: tokenDto;
};

export type authTokenDto = {
  id: number;
  isCompanion: boolean;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  Images: string[];
  isEmailVerified: boolean;
};

export interface requestTokenDto {
  email: string;
  reId: number;
  role: string;
}
