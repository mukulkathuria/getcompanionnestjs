import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from 'src/Services/googlelogin.service';
import { S3Service } from 'src/Services/s3.service';

@Module({
  providers: [AuthService, GoogleService, S3Service],
  controllers: [AuthController],
})
export class AuthModule {}