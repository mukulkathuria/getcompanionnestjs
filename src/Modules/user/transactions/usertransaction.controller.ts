import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserTransactionInnerRoute, UserTransactionsRoute } from '../routes/user.routes';
import { UserTransactionService } from './usertransaction.service';
import {
  BookingTransactionReturnDto,
  getHashInputDto,
  initiatePaymentInputDto,
  payUTransactionDetailsDto,
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
  @Post(UserTransactionInnerRoute.gethashfortransaction)
  @HttpCode(200)
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

  @UseGuards(AuthGuard)
  @Post(UserTransactionInnerRoute.initiatepayment)
  @HttpCode(200)
  async initiatePayment(@Body() userInputs: initiatePaymentInputDto) {
    const { data, error } =
      await this.usertransactionservice.initiatePayment(userInputs);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserTransactionInnerRoute.onsuccesspayment)
  @HttpCode(200)
  async successPayment(@Body() userInputs: payUTransactionDetailsDto) {
    const { success, error } =
      await this.usertransactionservice.onsuccessfullPayment(userInputs);
    if (success) {
      return {
        success: true,
        message: 'Transaction Updated Successfully',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserTransactionInnerRoute.onfailurepayment)
  @HttpCode(200)
  async onfailurePayment(@Body() userInputs: payUTransactionDetailsDto) {
    const { success, error } =
      await this.usertransactionservice.onFailedPayment(userInputs);
    if (success) {
      return {
        success: true,
        message: 'Transaction Updated Successfully',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserTransactionInnerRoute.onsuccesspaymentofextension)
  @HttpCode(200)
  async successPaymentofExtensionController(@Body() userInputs: payUTransactionDetailsDto) {
    const { success, error } =
      await this.usertransactionservice.onsuccessfullPaymentofExtension(userInputs);
    if (success) {
      return {
        success: true,
        message: 'Transaction Updated Successfully',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserTransactionInnerRoute.onfailurepaymentofextension)
  @HttpCode(200)
  async onfailurePaymentofExtensionController(@Body() userInputs: payUTransactionDetailsDto) {
    const { success, error } =
      await this.usertransactionservice.onFailedPaymentofExtension(userInputs);
    if (success) {
      return {
        success: true,
        message: 'Transaction Updated Successfully',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
