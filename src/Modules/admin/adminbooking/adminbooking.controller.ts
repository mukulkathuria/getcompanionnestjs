import { Controller, Get, HttpException, UseGuards } from "@nestjs/common";
import { AdminUserBookingsRoute } from "../routes/admin.routes";
import { AdminBookingService } from "./adminbooking.service";
import { AdminGuard } from "src/guards/admin.guard";

@Controller(AdminUserBookingsRoute)
export class AdminBookingController {
  constructor(private readonly adminbookingservice: AdminBookingService) {}

  @UseGuards(AdminGuard)
  @Get()
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
}