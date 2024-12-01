import { Module } from '@nestjs/common';
import { UserTransactionController } from './usertransaction.controller';
import { UserTransactionService } from './usertransaction.service';
import { PaymentService } from 'src/Services/payment.service';

@Module({
  controllers: [UserTransactionController],
  providers: [UserTransactionService, PaymentService],
})
export class UserTransactionModule {}
