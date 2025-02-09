import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAcceptanceRoute } from '../routes/admin.routes';
import { AdminGuard } from 'src/guards/admin.guard';
import { AcceptanceService } from './acceptance.service';
import { bookingIdDto } from 'src/dto/bookings.dto';

@Controller(AdminAcceptanceRoute)
export class AcceptanceController {
  constructor(private readonly acceptanceservice: AcceptanceService) {}

  @UseGuards(AdminGuard)
  @Get('booking')
  async acceptBookingController(@Query() bookingdetails: bookingIdDto) {
    if (!bookingdetails.bookingid) {
      throw new HttpException('Booking id is required', 422);
    }

    const { success, error } = await this.acceptanceservice.acceptBooking(
      Number(bookingdetails.bookingid),
    );
    if (success) {
      return {
        success,
        message: 'Request Accepted successfully',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
