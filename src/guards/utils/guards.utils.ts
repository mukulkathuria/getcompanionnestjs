import { AccessTokenDto } from 'src/dto/tokens.dto';

export const getRequesttokenParams = (
  tokendata: AccessTokenDto,
  isAdmin: boolean = false,
) => {
  const data = {
    userid: tokendata.userId,
    email: tokendata.email,
    reId: tokendata.reId,
    role: tokendata.role,
  };
  if (isAdmin) data['isCompanion'] = tokendata.isCompanion;
  return data;
};
