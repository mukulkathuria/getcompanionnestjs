import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { validateToken } from './strategies/jwt.strategy';
import { getRequesttokenParams } from './utils/guards.utils';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    const { data, error } = validateToken(authorization);
    if (data) {
      const tokendata = getRequesttokenParams(data);
      request = { ...request, ...tokendata };
      return true;
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
