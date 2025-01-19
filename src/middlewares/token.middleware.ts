import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AccessTokenDto } from 'src/dto/tokens.dto';

@Injectable()
export class Tokenmiddleware implements NestMiddleware {
  use(
    req: Request | (Request & AccessTokenDto),
    res: Response,
    next: NextFunction,
  ) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (token) {
      try {
        const decodedToken = jwt.decode(token) as AccessTokenDto;
        if (decodedToken) {
          const updatedReq = { ...req, ...decodedToken } as Request &
            AccessTokenDto;
            console.log("Decoded Token", decodedToken)
          req = updatedReq;
        }
      } catch (error) {
        console.error('Invalid token', error);
      }
    }

    next();
  }
}
