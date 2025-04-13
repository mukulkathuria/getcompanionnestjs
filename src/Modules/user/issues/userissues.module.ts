import { Module } from '@nestjs/common';
import { UserIssuesController } from './userissues.controller';
import { UserIssuesServices } from './userissues.service';
import { S3Service } from 'src/Services/s3.service';

@Module({
  controllers: [UserIssuesController],
  providers: [UserIssuesServices, S3Service],
})
export class UserIssuesModule {}
