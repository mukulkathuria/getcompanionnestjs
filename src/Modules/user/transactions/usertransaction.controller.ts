import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import { UserTransactionsRoute } from '../routes/user.routes';
import { UserTransactionService } from './usertransaction.service';
import { BookingTransactionReturnDto } from 'src/dto/transactions.dto';

@Controller(UserTransactionsRoute)
export class UserTransactionController {
  constructor(
    private readonly usertransactionservice: UserTransactionService,
  ) {}

  @Get()
  async getAllLocations(): Promise<BookingTransactionReturnDto> {
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
}
