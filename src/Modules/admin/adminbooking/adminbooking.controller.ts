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
import {
  AdminBookingInnerRoutes,
  AdminUserBookingsRoute,
} from '../routes/admin.routes';
import { AdminBookingService } from './adminbooking.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { bookingIdDto, pageNoQueryDto, updateBookingStatusInputDto } from 'src/dto/bookings.dto';

@Controller(AdminUserBookingsRoute)
export class AdminBookingController {
  constructor(private readonly adminbookingservice: AdminBookingService) {}

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.bookingrequestroute)
  async getAllUserBooking() {
    const { data, error } =
      await this.adminbookingservice.getAllAdminBookings();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Post(AdminBookingInnerRoutes.bookingdetailsroute)
  @HttpCode(200)
  async getAdminBookingDetails(@Body() bookingid: bookingIdDto) {
    const { data, error } = await this.adminbookingservice.getBookingDetails(
      bookingid?.bookingid,
    );
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.getallbookinglistroute)
  async getAllBookingList(@Query() queryparms: pageNoQueryDto) {
    const { data, error } = await this.adminbookingservice.getBookingList(queryparms);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.getcancelledbookinglistroute)
  async getUnderCancellationBooking() {
    const { data, error } =
      await this.adminbookingservice.getCancellationRequest();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.getunderextensionbookinglistroute)
  async getUnderExtensionBooking() {
    const { data, error } =
      await this.adminbookingservice.getExtensionRequest();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.getcancelledbookinglistofuserroute)
  async getCancellationRequesListofUserController() {
    const { data, error } =
      await this.adminbookingservice.getCancellationRequesListofUser();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Post(AdminBookingInnerRoutes.updatebookingstatusRoute)
  @HttpCode(200)
  async updateBookingStatusController(@Body() params: updateBookingStatusInputDto) {
    const { success, error } =
      await this.adminbookingservice.updateBookingStatus(params);
    if (success) {
      return {
        success,
        message: 'Booking Status Updated Successfully'
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminBookingInnerRoutes.getpendingrefundbookinglistRoute)
  async getFefundPendingBookinglistController() {
    const { data, error } =
      await this.adminbookingservice.getPendingRefundBookingList();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
