import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserTransactionsRoute } from '../routes/user.routes';
import { UserTransactionService } from './usertransaction.service';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
} from 'src/dto/transactions.dto';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller(UserTransactionsRoute)
export class UserTransactionController {
  constructor(
    private readonly usertransactionservice: UserTransactionService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTransactionforBookingid(): Promise<BookingTransactionReturnDto> {
    const { data, error } =
      await this.usertransactionservice.getAllTransactionForBooking(1);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post('gethashfortransaction')
  async getHashfortransactionController(@Body() userInputs: getHashInputDto) {
    const { data, error } =
      await this.usertransactionservice.getHashforTransaction(userInputs);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
