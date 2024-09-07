import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserBookingsRoute } from '../routes/user.routes';
import { UserBookingsService } from './userbooking.service';
import { AuthGuard } from 'src/guards/jwt.guard';
import { userBookingBodyDto } from 'src/dto/bookings.dto';
import { controllerReturnDto } from 'src/dto/common.dto';

@Controller(UserBookingsRoute)
export class UserBookingController {
  constructor(private readonly userbookingservice: UserBookingsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllUserBooking() {
    const { data, error } =
      await this.userbookingservice.getAllBookingsForUser();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post('bookingcompanion')
  @HttpCode(200)
  async createBookingDetailsController(
    @Body() userinfo: userBookingBodyDto,
  ): Promise<controllerReturnDto> {
    const { success, error } =
      await this.userbookingservice.bookaCompanion(userinfo);
    if (success) {
      return {
        success,
        message: 'Booking created successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
