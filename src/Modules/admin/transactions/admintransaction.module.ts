import { Module } from '@nestjs/common';
import { AdminTransactionController } from './admintransaction.controller';
import { AdminTransactionService } from './admintransaction.service';
import { PaymentService } from 'src/Services/payment.service';

@Module({
  controllers: [AdminTransactionController],
  providers: [AdminTransactionService, PaymentService],
})
export class AdminTransactionModule {}
