import { Module } from '@nestjs/common';
import { AcceptanceController } from './accceptance.controller';
import { AcceptanceService } from './acceptance.service';

@Module({
  controllers: [AcceptanceController],
  providers: [AcceptanceService],
})
export class AcceptanceModule {}
