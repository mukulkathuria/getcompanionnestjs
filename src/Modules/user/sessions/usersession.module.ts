import { Module } from '@nestjs/common';
import { UserSessionService } from './usersession.service';
import { UserSessionController } from './usersession.controller';

@Module({
  controllers: [UserSessionController],
  providers: [UserSessionService],
})
export class UserSessionModule {}
