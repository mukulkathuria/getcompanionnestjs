import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAcceptanceInnerRoute, AdminAcceptanceRoute } from '../routes/admin.routes';
import { AdminGuard } from 'src/guards/admin.guard';
import { AcceptanceService } from './acceptance.service';
import { bookingIdDto } from 'src/dto/bookings.dto';
import { statusUpdateInputDto } from 'src/dto/admin.module.dto';

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

   @UseGuards(AdminGuard)
    @Post(AdminAcceptanceInnerRoute.updatecancellationstatusroute)
    @HttpCode(200)
    async updateCompanionRequestStatusController(
      @Body() requestInput: statusUpdateInputDto,
    ) {
      const { success, error } =
        await this.acceptanceservice.updateCancellationRequestStatus(requestInput);
      if (success) {
        return {
          success,
          message: 'Status updated Successfully.',
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    }

    @UseGuards(AdminGuard)
    @Get(AdminAcceptanceInnerRoute.rejectbookingsroute)
    async rejectBookingController(@Query() bookingdetails: bookingIdDto) {
      if (!bookingdetails.bookingid) {
        throw new HttpException('Booking id is required', 422);
      }
  
      const { success, error } = await this.acceptanceservice.rejectBooking(
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
