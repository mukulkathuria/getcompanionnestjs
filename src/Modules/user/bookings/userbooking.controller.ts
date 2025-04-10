import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
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
  pageNoQueryDto,
  ratingInputDto,
  userBookingBodyDto,
} from 'src/dto/bookings.dto';
import { controllerReturnDto } from 'src/dto/common.dto';
import { decodeExpressRequest } from 'src/guards/strategies/jwt.strategy';
import { companionDetailsQuery } from 'src/dto/companionfind.dto';
import { UserlocationProfileDto, UserProfileParamsDto } from 'src/dto/user.dto';

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
  async getpreviousbookingcontroller(
    @Req() req: Request,
    @Query() params: pageNoQueryDto,
  ) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getpreviousBookingsForUser(
        tokendata.userId,
        params,
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
  async checkCompanionSlotController(
    @Query() companionId: companionDetailsQuery,
  ) {
    const { data, error } =
      await this.userbookingservice.checkBookedSlotsforCompanion(
        companionId.companionId,
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
  @Post(UserBookingInnerRoute.cancelbooking)
  async cancelBookingController(
    @Body() bookingDetails: cancelBookingInputDto,
    @Req() req: Request,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } = await this.userbookingservice.cancelBooking(
        bookingDetails,
        data.userId,
      );
      if (success) {
        return {
          data: success,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError || 'Server Error', 403);
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

  @UseGuards(AuthGuard)
  @Post(UserBookingInnerRoute.rateabookingRoute)
  @HttpCode(200)
  async rateabookingController(
    @Body() ratingDetails: ratingInputDto,
    @Req() req: Request,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } =
        await this.userbookingservice.rateabookingservice({
          ...ratingDetails,
          userId: data.userId,
        });
      if (success) {
        return {
          success,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException('Server Error', 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.getBookingDetailsforall)
  async getBookingDetailsforAllController(@Query() bookingid: bookingIdDto) {
    const { data, error } =
      await this.userbookingservice.getBookingforAllService(
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

  @Get(UserBookingInnerRoute.getAverageRating)
  async getAverageRatingofCompanionController(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: TokenData, error: TokenError } = decodeExpressRequest(req);
    if (TokenData) {
      const { data, error } = await this.userbookingservice.getRatingforUser(
        TokenData.userId,
      );
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException('Server Error', 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserBookingInnerRoute.getupcomingbookingforcompanion)
  async getupcomingbookingforcompanionController(@Req() req: Request) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getUpcomingBookingsForCompanion(
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
  @Get(UserBookingInnerRoute.getupcomingbookingforuser)
  async getupcomingbookingforuserController(@Req() req: Request) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getUpcomingBookingsForUser(
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
  @Get(UserBookingInnerRoute.getpreviousbookingforcompanion)
  async getpreviousbookingforcompanionController(
    @Req() req: Request,
    @Query() params: pageNoQueryDto,
  ) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getpreviousBookingsForCompanion(
        tokendata.userId,
        params,
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
  @Get(UserBookingInnerRoute.getlivelocationofbookingRoute)
  async getlivelocationforbookingController(
    @Query() bookingid: bookingIdDto,
    @Req() req: Request,
  ) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { data, error } =
      await this.userbookingservice.getLiveLocationforBooking(
        Number(bookingid?.bookingid),
        tokendata.userId
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
  @Post(UserBookingInnerRoute.updatelivelocationofbookingRoute)
  async updatelivelocationforbookingController(
    @Param() id: UserProfileParamsDto,
    @Body() bodyparams: UserlocationProfileDto,
    @Req() req: Request,
  ) {
    const { data: tokendata, error: TokenError } = decodeExpressRequest(req);
    if (TokenError) {
      throw new HttpException('Invalid User', 403);
    }
    const { success, error } =
      await this.userbookingservice.updateLiveLocation(
        Number(id.id),
        bodyparams,
        tokendata.userId
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
