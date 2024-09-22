import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { validateToken } from './strategies/jwt.strategy';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const server: Server = context.switchToWs().getClient<Server>();
    const { token } = request.handshake?.auth;
    const { data, error } = validateToken(token as string);
    if (data) {
      request.username = data.name;
      return true;
    } else {
      if (error.status === 403) {
        server.emit('tokenexpired', 'Token not vaid');
      } else {
        server.emit('invalidUser', error.message);
      }
      throw new WsException(error.message);
    }
  }
}