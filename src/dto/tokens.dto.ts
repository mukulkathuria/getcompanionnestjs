export type tokenDto = {
  userId: string;
  isCompanion: boolean;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export interface AccessTokenDto extends tokenDto {
  reId: string;
}

export interface RefreshTokenDto extends tokenDto {
  id: string;
}

export type refreshTokenObjDto = {
  [key: string]: tokenDto;
};

export type authTokenDto = {
  id: string;
  isCompanion: boolean;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
};

export interface requestTokenDto {
  email: string;
  reId: string;
  role: string;
}
