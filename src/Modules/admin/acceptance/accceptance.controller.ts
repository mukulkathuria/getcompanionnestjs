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

@Controller(AdminAcceptanceRoute)
export class AcceptanceController {
  constructor(private readonly acceptanceservice: AcceptanceService) {}

  @UseGuards(AdminGuard)
  @Get('booking')
  async acceptBookingController(@Query() bookingid: string) {
    if (!bookingid || !bookingid.trim().length) {
      throw new HttpException('Booking id is required', 422);
    }
    try {
      const { success, error } = await this.acceptanceservice.acceptBooking(
        Number(bookingid),
      );
      if (success) {
        return {
          success,
          message: 'Companion created successfully.',
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
      // eslint-disable-next-line
    } catch (error) {
      throw new HttpException('Server error', 500);
    }
  }
}
