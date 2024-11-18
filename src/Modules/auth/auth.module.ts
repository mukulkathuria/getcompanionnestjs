import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from 'src/Services/googlelogin.service';

@Module({
  providers: [AuthService, GoogleService],
  controllers: [AuthController],
})
export class AuthModule {}
