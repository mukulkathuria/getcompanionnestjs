import { Body, Controller, Get, HttpException, Query } from '@nestjs/common';
import { CompanionBookingInnerRoutes } from '../routes/companion.routes';
import { bookingIdDto, cancelBookingInputDto } from 'src/dto/bookings.dto';
import { CompanionBookingService } from './companionbooking.service';
import { ApiControllerTag } from 'src/swagger/decorators';


@ApiControllerTag('companion-companionbooking')
@Controller(CompanionBookingInnerRoutes.baseUrl)
export class CompanionBookingController {
  constructor(
    private readonly companionbookingservice: CompanionBookingService,
  ) {}

  @Get(CompanionBookingInnerRoutes.companionbookingdetails)
  async getCompanionBookingDetails(@Query() bookingparam: bookingIdDto) {
    const { data, error } =
      await this.companionbookingservice.getcompanionBookingDetails(
        bookingparam,
      );
    if (data) {
      return { data };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(CompanionBookingInnerRoutes.companionacceptbooking)
  async companionacceptbooking(@Query() bookingparam: bookingIdDto) {
    const { success, error } =
      await this.companionbookingservice.acceptBooking(bookingparam);
    if (success) {
      return { success };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(CompanionBookingInnerRoutes.companionrejectbooking)
  async companionrejectbooking(@Query() bookingparam: cancelBookingInputDto) {
    const { success, error } =
      await this.companionbookingservice.rejectBooking(bookingparam);
    if (success) {
      return { success };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
