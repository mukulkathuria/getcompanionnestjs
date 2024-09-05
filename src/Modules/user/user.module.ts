import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CompanionFindModule } from './companionfind/companionfind.module';
import { UserBookingModule } from './bookings/userbooking.module';
import { UserTransactionModule } from './transactions/usertransaction.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    CompanionFindModule,
    UserBookingModule,
    UserTransactionModule,
    UsersModule,
  ],
})
export class UserModule {}
