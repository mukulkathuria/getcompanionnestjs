import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CompanionFindModule } from './companionfind/companionfind.module';
import { UserBookingModule } from './bookings/userbooking.module';
import { UserTransactionModule } from './transactions/usertransaction.module';
// import { MulterModule } from '@nestjs/platform-express';
import { UserSessionModule } from './sessions/usersession.module';
import { S3Service } from 'src/Services/s3.service';
import { UserNotificationModule } from './notifications/usernotifications.module';

@Module({
  imports: [
    CompanionFindModule,
    UserBookingModule,
    UserTransactionModule,
    UserSessionModule,
    UsersModule,
    UserNotificationModule
  ],
  providers: [S3Service],
})
export class UserModule {}
