import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminTransactionService } from './admintransaction.service';
import {
  AdminTransactionInnerRoutes,
  AdminTransactionRoute,
} from '../routes/admin.routes';
import { AdminGuard } from 'src/guards/admin.guard';
import { refundAmountInputDto } from 'src/dto/admin.module.dto';

@Controller(AdminTransactionRoute)
export class AdminTransactionController {
  constructor(
    private readonly usertransactionservice: AdminTransactionService,
  ) {}

  @UseGuards(AdminGuard)
  @Post(AdminTransactionInnerRoutes.onsuccessfullrefundamount)
  async onsuccessrefundpayment(
    @Body() userInputs: refundAmountInputDto,
    @Req() req: Request,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } =
        await this.usertransactionservice.onsuccessfullRefundPayment(
          userInputs,
          data.userId,
        );
      if (success) {
        return {
          success,
          message: 'Successfully created entry for refund amount',
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError, 422);
    }
  }
}
