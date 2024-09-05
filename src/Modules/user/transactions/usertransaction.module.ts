import { Module } from '@nestjs/common';
import { UserTransactionController } from './usertransaction.controller';
import { UserTransactionService } from './usertransaction.service';

@Module({
  controllers: [UserTransactionController],
  providers: [UserTransactionService],
})
export class UserTransactionModule {}
