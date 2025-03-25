import { Module } from '@nestjs/common';
import { DeleteUsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Service } from 'src/Services/s3.service';

@Module({
  controllers: [DeleteUsersController],
  providers: [UsersService, S3Service],
})
export class UsersModule {}
