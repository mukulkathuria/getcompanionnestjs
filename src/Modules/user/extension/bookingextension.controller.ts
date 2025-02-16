import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/jwt.guard';
import { BookingExtentionService } from './bookingextension.service';
import {
  UserExtensionInnerRoute,
  UserExtensionRoute,
} from '../routes/user.routes';
import { bookingIdDto, updateextensionbokingInputDto } from 'src/dto/bookings.dto';

@Controller(UserExtensionRoute)
export class BookingExtentionController {
  constructor(private readonly bookingservice: BookingExtentionService) {}

  @UseGuards(AuthGuard)
  @Get(UserExtensionInnerRoute.getextensiondetails)
  async getExtensionBookingDetails(@Query() bookingdetails: bookingIdDto) {
    const { data, error } = await this.bookingservice.getExtensionDetails(
      Number(bookingdetails.bookingid),
    );
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserExtensionInnerRoute.updaterecordextension)
  async updateExtensionRecord(@Body() bookingDetails: updateextensionbokingInputDto) {
    const { success, error } =
      await this.bookingservice.updateExtensionBookngDetails(bookingDetails);
    if (success) {
      return {
        success,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserExtensionInnerRoute.updatebeforeextension)
  async updateBeforeExtensionRecord(@Query() bookingdetails: bookingIdDto) {
    const { success, error } = await this.bookingservice.whenRejectedBooking(
      Number(bookingdetails.bookingid),
    );
    if (success) {
      return {
        success,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
