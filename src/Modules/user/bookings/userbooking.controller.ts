import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  UserBookingInnerRoute,
  UserBookingsRoute,
} from '../routes/user.routes';
import { UserBookingsService } from './userbooking.service';
import { AuthGuard } from 'src/guards/jwt.guard';
import {
  bookingIdDto,
  cancelBookingInputDto,
  userBookingBodyDto,
} from 'src/dto/bookings.dto';
import { controllerReturnDto } from 'src/dto/common.dto';
import { decodeExpressRequest } from 'src/guards/strategies/jwt.strategy';

@Controller(UserBookingsRoute)
export class UserBookingController {
  constructor(private readonly userbookingservice: UserBookingsService) {}

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.upcomingbooking)
  async getAllUpcomingBookingController(@Query() userId: string) {
    const { data, error } =
      await this.userbookingservice.getAllBookingsForUser(userId);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.previousbookings)
  async getpreviousbookingcontroller(@Req() req: Request) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getpreviousBookingsForUser(
        tokendata.userId,
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
  @Post(UserBookingInnerRoute.bookacompanion)
  @HttpCode(200)
  async createBookingDetailsController(
    @Body() userinfo: userBookingBodyDto,
  ): Promise<controllerReturnDto & bookingIdDto> {
    const { success, bookingid, error } =
      await this.userbookingservice.bookaCompanion(userinfo);
    if (success) {
      return {
        success,
        bookingid: bookingid,
        message: 'Booking created successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.checkcompanionslot)
  async checkCompanionSlotController(@Query() companionId: string) {
    const { data, error } =
      await this.userbookingservice.checkBookedSlotsforCompanion(companionId);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserBookingInnerRoute.cancelbooking)
  async cancelBookingController(@Body() bookingDetails: cancelBookingInputDto) {
    const { success, error } =
      await this.userbookingservice.cancelBooking(bookingDetails);
    if (success) {
      return {
        data: success,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.getBookingDetailsforUser)
  async getBookingDetailsController(@Query() bookingid: bookingIdDto) {
    const { data, error } = await this.userbookingservice.getUserBookingDetails(
      String(bookingid?.bookingid),
    );
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
