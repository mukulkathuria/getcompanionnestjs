import { Controller, Get, HttpException } from '@nestjs/common';
import { UserBookingsRoute } from '../routes/user.routes';
import { UserBookingsService } from './userbooking.service';

@Controller(UserBookingsRoute)
export class UserBookingController {
  constructor(private readonly userbookingservice: UserBookingsService) {}

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
}
