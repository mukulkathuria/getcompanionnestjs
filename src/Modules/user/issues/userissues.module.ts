import { Module } from '@nestjs/common';
import { UserIssuesController } from './userissues.controller';
import { UserIssuesServices } from './userissues.service';

@Module({
  controllers: [UserIssuesController],
  providers: [UserIssuesServices],
})
export class UserIssuesModule {}
