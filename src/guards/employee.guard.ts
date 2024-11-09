import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Roles } from 'src/dto/auth.module.dto';
import { validateToken } from './strategies/jwt.strategy';
import { getRequesttokenParams } from './utils/guards.utils';

@Injectable()
export class EmployeeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    const { data, error } = validateToken(authorization);
    if (data) {
      if (data.role !== Roles.EMPLOYEE) {
        throw new HttpException('Invalid login. Please contact admin.', 403);
      } else {
        const tokendata = getRequesttokenParams(data, true);
        request = { ...request, ...tokendata };
        return true;
      }
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
